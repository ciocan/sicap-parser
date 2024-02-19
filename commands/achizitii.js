import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Text, Box } from "ink"
import prettyMs from "pretty-ms"
import es from "@elastic/elasticsearch"
import PromisePool from "@supercharge/promise-pool"
import fs from "fs"
import fetch from "node-fetch"

import { Container, Error, Progress } from "../components"
import { checkDate, getDurationInMilliseconds, yesterday } from "../lib/utils"
import { getAllDirect, getPublicDirectAcquisition, getAuthority, getSupplier } from "../lib/sicap-api.js"
import { transformPublicDirectAcquisition, transformSupplier, transformAuthority } from "../lib/transformers.js"

const start = process.hrtime()

/// Indexeaza achizitiile directe
function Achizitii({ date, host, index, concurrency, archive }) {
  const client = new es.Client({ node: host, 
    tls: {
      rejectUnauthorized: false,
    },
  })

  const [total, setTotal] = useState(0)
  const [totalCpvs, setTotalCpvs] = useState(0)
  const [currentCpv, setCurrentCpv] = useState(0)
  const [current, setCurrent] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const error = checkDate(date)

  const processDay = async () => {
    const [dd, mm, yyyy] = date.split("-")

    const response = await fetch("http://raw.githubusercontent.com/arhiva-sicap/sicap-parser/master/cpvs.txt")
    const cpvsTxt = await response.text()
    const cpvs = cpvsTxt.split("\n").map((line) => line.split("|")[0])

    setTotalCpvs(cpvs.length)

    await new PromisePool()
      .for(cpvs)
      .withConcurrency(concurrency)
      .process(async (cpvCodeId) => {
        const contracts = await getAllDirect(`${yyyy}-${mm}-${dd}`, { cpvCodeId, istoric: archive })
        setCurrentCpv((c) => c + 1)

        if (contracts.searchTooLong) {
          fs.appendFileSync("log-all-toolong.txt", `${cpvCodeId}|${date}\n`)
        }

        if (contracts.total > 0) {
          setTotal((t) => t + contracts.total)

          for (const item of contracts.items) {
            setCurrent((c) => c + 1)
            setElapsed(prettyMs(getDurationInMilliseconds(start), { secondsDecimalDigits: 0 }))

            const id = item.directAcquisitionId
            const publicDirectAcquisition = await getPublicDirectAcquisition(id, { istoric: archive })
            const authority = await getAuthority(publicDirectAcquisition.contractingAuthorityID, {
              istoric: archive,
              client,
            })
            const supplier = await getSupplier(publicDirectAcquisition.supplierId, { istoric: archive, client })

            const doc = {
              item,
              publicDirectAcquisition: transformPublicDirectAcquisition(publicDirectAcquisition),
              authority: transformAuthority(authority),
              supplier: transformSupplier(supplier),
              istoric: archive,
            }

            await client
              .update({
                id: item.directAcquisitionId,
                retry_on_conflict: 3,
                index,
                body: {
                  doc,
                  doc_as_upsert: true,
                },
              })
              .catch((error) => {
                console.error(error)
                console.info(
                  `-----> UPDATE ERROR ON: [${item.directAcquisitionId}]|${cpvCodeId}|${date} \n`,
                  error.meta.body.error
                )
                process.exit(1)
              })
          }
        }
      })
  }

  useEffect(() => {
    processDay()
  }, [])

  const percent = currentCpv / totalCpvs || 0
  return (
    <Container>
      {error ? (
        <Error text={error} />
      ) : (
        <Box>
          <Text>{date} | </Text>
          <Progress percent={percent} />
          <Box marginLeft={2}>
            <Text>
              {`| ${Math.round(percent * 100)}% | `}
              {current}/{total} | {elapsed}
            </Text>
          </Box>
        </Box>
      )}
    </Container>
  )
}

Achizitii.propTypes = {
  /// Data in format zz-ll-aaaa - default ziua precedenta
  date: PropTypes.string,
  /// Url Elasticsearch (default localhost:9200)
  host: PropTypes.string,
  /// Indexul Elasticsearch folosit pentru licitatiile publice (default licitatii-publice)
  index: PropTypes.string,
  /// Numarul de accesari concurente spre siteul SEAP (default 5)
  concurrency: PropTypes.number,
  /// foloseste arhiva istorica (baza de date 2007-218)
  archive: PropTypes.bool,
}

Achizitii.defaultProps = {
  host: "http://localhost:9200",
  index: "achizitii-directe",
  concurrency: 5,
  archive: false,
  date: yesterday(),
}

Achizitii.shortFlags = {
  date: "d",
  host: "h",
  index: "i",
  concurrency: "c",
  archive: "a",
}

export default Achizitii

import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Text, Box } from "ink"
import prettyMs from "pretty-ms"
import Spinner from "ink-spinner"
import es from "@elastic/elasticsearch"
import PromisePool from "@supercharge/promise-pool"

import { Container, Error, Progress } from "../components"
import { checkDate, getDurationInMilliseconds, yesterday } from "../lib/utils"
import { getAll, getPublicNotice, getPublicNoticeContracts } from "../lib/sicap-api.js"
import { transformItem, transformPublicNotice, transformNoticeContracts } from "../lib/transformers.js"

const start = process.hrtime()

/// Indexeaza licitatiile publice
function Licitatii({ date, host, index, concurrency, archive }) {
  const client = new es.Client({ node: host })

  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [isLoading, setLoading] = useState(false)

  const error = checkDate(date)

  const processDay = async () => {
    const [dd, mm, yyyy] = date.split("-")
    setLoading(true)
    const noticeList = await getAll(`${yyyy}-${mm}-${dd}`, { istoric: archive })
    setTotal(noticeList.items.length)
    setLoading(false)

    await new PromisePool()
      .for(noticeList.items)
      .withConcurrency(concurrency)
      .process(async (item) => {
        const { caNoticeId } = item
        const [publicNotice, noticeContracts] = await Promise.all([
          getPublicNotice(caNoticeId, { date, istoric: archive }),
          getPublicNoticeContracts(caNoticeId, { date, istoric: archive }),
        ])

        await client
          .update({
            id: caNoticeId,
            index,
            body: {
              doc: {
                item: transformItem(item),
                publicNotice: transformPublicNotice(publicNotice),
                noticeContracts: transformNoticeContracts(noticeContracts),
                istoric: archive,
              },
              doc_as_upsert: true,
            },
          })
          .catch((error) => {
            console.error(error)
            console.info(`-----> UPDATE ERROR ON: [${caNoticeId} \n`, error.meta.body.error)
            process.exit(1)
          })

        setElapsed(prettyMs(getDurationInMilliseconds(start), { secondsDecimalDigits: 0 }))
        setCurrent((c) => c + 1)
      })
  }

  useEffect(() => {
    processDay()
  }, [])

  const percent = current / total || 0
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
              {current}/
              {!isLoading ? (
                total
              ) : (
                <Text color="green">
                  <Spinner type="dots" />
                </Text>
              )}{" "}
              | {elapsed}
            </Text>
          </Box>
        </Box>
      )}
    </Container>
  )
}

Licitatii.propTypes = {
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

Licitatii.defaultProps = {
  host: "http://localhost:9200",
  index: "licitatii-publice",
  concurrency: 5,
  archive: false,
  date: yesterday(),
}

Licitatii.shortFlags = {
  date: "d",
  host: "h",
  index: "i",
  concurrency: "c",
  archive: "a",
}

export default Licitatii

import fs from "fs"
import nodeFetch from "node-fetch"
import fetchRetry from "fetch-retry"

const fetch = fetchRetry(nodeFetch)

const retries = 8
const retryDelay = (attempt) => Math.pow(2, attempt) * 1000

const retryOn = (caNoticeId, method, day) => (attempt, error, response) => {
	if (response.status !== 200) {
		fs.appendFileSync(
			"log-retries-error.log",
			`${day} > ${caNoticeId}|${method}|${response.status}|${attempt} > ERR: ${JSON.stringify(response)} \n`
		)
	}
	if (response.statusText === "Bad Request") {
		fs.appendFileSync(
			"log-errors-bad-request.log",
			`${day} > ${caNoticeId}|${method}|${response.status} > ERR: ${error} \n`
		)
		return false
	}

	if (error !== null || response.status > 400) {
		fs.appendFileSync(
			"log-retries.log",
			`${day} > ${caNoticeId}|${method}|${response.status}|${attempt} ... ERR: ${error} \n`
		)
		return true
	}
}

export async function getAll(date, { istoric = false }) {
	if (!date) return

	const istoricUrlFragment = istoric ? "istoric." : ""

	const body = {
		sysNoticeTypeIds: [3, 13, 18, 16, 8],
		sortProperties: [],
		pageSize: 2000,
		sysNoticeStateId: null,
		contractingAuthorityId: null,
		winnerId: null,
		cPVCategoryId: null,
		sysContractAssigmentTypeId: null,
		cPVId: null,
		assignedUserId: null,
		sysAcquisitionContractTypeId: null,
		pageIndex: 0,
		startPublicationDate: date,
		endPublicationDate: date,
	}

	const response = await fetch(`http://${istoricUrlFragment}e-licitatie.ro/api-pub/NoticeCommon/GetCANoticeList/`, {
		retries,
		retryDelay,
		method: "POST",
		headers: {
			"Content-Type": "application/json;charset=UTF-8",
			Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
		},
		body: JSON.stringify(body),
	})

	return await response.json()
}

export async function getPublicNotice(caNoticeId, { day, istoric = false }) {
	if (!caNoticeId) return

	const istoricUrlFragment = istoric ? "istoric." : ""

	try {
		const response = await fetch(
			`http://${istoricUrlFragment}e-licitatie.ro/api-pub/C_PUBLIC_CANotice/get/${caNoticeId}`,
			{
				retries,
				retryDelay,
				retryOn: retryOn(caNoticeId, "getPublicNotice", day),
				method: "GET",
				headers: {
					"Content-Type": "application/json;charset=UTF-8",
					Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
				},
			}
		)
		const json = await response.json()
		return json
	} catch (e) {
		console.log("!!!!!!", e)
		process.exit(1)
		return null
	}
}

export async function getPublicNoticeContracts(caNoticeId, { day, istoric = false }) {
	if (!caNoticeId) return

	const body = {
		caNoticeId,
		contractNo: null,
		winnerTitle: null,
		winnerFiscalNumber: null,
		contractDate: {
			from: null,
			to: null,
		},
		contractValue: {
			from: null,
			to: null,
		},
		contractMinOffer: {
			from: null,
			to: null,
		},
		contractMaxOffer: {
			from: null,
			to: null,
		},
		contractTitle: null,
		lots: null,
		sortOrder: [],
		sysContractFrameworkType: {},
		skip: 0,
		take: 200,
	}

	const istoricUrlFragment = istoric ? "istoric." : ""

	const response = await fetch(
		`http://${istoricUrlFragment}e-licitatie.ro/api-pub/C_PUBLIC_CANotice/GetCANoticeContracts`,
		{
			retries,
			retryDelay,
			retryOn: retryOn(caNoticeId, "getPublicNoticeContracts", day),
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
			body: JSON.stringify(body),
		}
	)

	return await response.json()
}

// direct-acquisitions
export async function getAllDirect(
	date,
	{
		endDate = null,
		contractingAuthorityId = null,
		supplierId = null,
		cpvCategoryId = null,
		cpvCodeId = null,
		istoric = false,
	}
) {
	if (!date) return

	const istoricUrlFragment = istoric ? "istoric." : ""

	const body = {
		pageSize: 2000,
		showOngoingDa: false,
		cookieContext: null,
		pageIndex: 0,
		sysDirectAcquisitionStateId: null,
		publicationDateStart: null,
		publicationDateEnd: null,
		finalizationDateStart: date,
		finalizationDateEnd: endDate || date,
		cpvCategoryId: cpvCategoryId,
		contractingAuthorityId: contractingAuthorityId,
		supplierId: supplierId,
		cpvCodeId: cpvCodeId,
	}

	const response = await fetch(
		`http://${istoricUrlFragment}e-licitatie.ro/api-pub/DirectAcquisitionCommon/GetDirectAcquisitionList/`,
		{
			retries,
			retryDelay,
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
			body: JSON.stringify(body),
		}
	)

	return await response.json()
}

export async function getPublicDirectAcquisition(id, { istoric = false }) {
	const istoricUrlFragment = istoric ? "istoric." : ""

	const response = await fetch(
		`http://${istoricUrlFragment}e-licitatie.ro/api-pub/PublicDirectAcquisition/getView/${id}`,
		{
			retries,
			retryDelay,
			retryOn: retryOn(id, "getPublicDirectAcquisition"),
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
		}
	)

	return await response.json()
}

export async function getCAEntityView(entityId, { istoric = false }) {
	const istoricUrlFragment = istoric ? "istoric." : ""

	const response = await fetch(
		`http://${istoricUrlFragment}e-licitatie.ro/api-pub/Entity/getCAEntityView/${entityId}`,
		{
			retries,
			retryDelay,
			retryOn: retryOn(entityId, "getCAEntityView"),
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
		}
	)

	return await response.json()
}

export async function getSUEntityView(entityId, { istoric = false }) {
	const istoricUrlFragment = istoric ? "istoric." : ""

	const response = await fetch(
		`http://${istoricUrlFragment}e-licitatie.ro/api-pub/Entity/getSUEntityView/${entityId}`,
		{
			retries,
			retryDelay,
			retryOn: retryOn(entityId, "getSUEntityView"),
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
		}
	)

	return await response.json()
}

export async function searchSuppliers(cui, { istoric = false }) {
	const istoricUrlFragment = istoric ? "istoric." : ""

	const response = await fetch(
		`http://${istoricUrlFragment}e-licitatie.ro/api-pub/ComboPub/searchSuppliers?filter=${cui}&pageIndex=0&pageSize=20&parentId=`,
		{
			retries,
			retryDelay,
			retryOn: retryOn(cui, "searchSuppliers"),
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
		}
	)

	return await response.json()
}

export async function searchCpvs(pageIndex = 0) {
	const response = await fetch(
		`http://e-licitatie.ro/api-pub/ComboPub/searchCpvs?filter=&pageIndex=${pageIndex}&pageSize=100&parentId=`,
		{
			retries,
			retryDelay,
			retryOn: retryOn(pageIndex, "searchCpvs"),
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Referer: "https://e-licitatie.ro/pub/notices/contract-notices/list/0/0",
			},
		}
	)

	return await response.json()
}

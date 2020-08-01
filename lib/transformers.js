import Ramda from "ramda"
import Lodash from "lodash"

const { omit } = Ramda
const { unset } = Lodash

const transformFiscalCode = (code) => code?.replace(/ro/i, "") / 1 || 0

export function transformItem(item) {
	const newItem = omit(
		[
			"errataNo",
			"estimatedValueExport",
			"highestOfferValue",
			"isOnline",
			"lowestOfferValue",
			"maxTenderReceiptDeadline",
			"minTenderReceiptDeadline",
			"sysNoticeVersionId",
			"tenderReceiptDeadlineExport",
			"versionNo",
		],
		item
	)

	newItem.cpvCode = item.cpvCodeAndName.split(" - ")[0]
	newItem.nationalId = item.contractingAuthorityNameAndFN.split("-")[0].replace(/ro/i, "") / 1

	return newItem
}

export function transformPublicNotice(notice) {
	if (!notice) return

	let newNotice = omit(
		[
			"acAssignedUser",
			"ackDocs",
			"ackDocsCount",
			"actions",
			"cNoticeId",
			"conditions",
			"createDate",
			"errorList",
			"hasErrors",
			"initState",
			"isCA",
			"isCompleting",
			"isCorrecting",
			"isLeProcedure",
			"isModifNotice",
			"isOnlineProcedure",
			"isView",
			"legislationType",
			"paapModel",
			"paapSpentValue",
			"parentCaNoticeId",
			"parentSysNoticeVersionId",
			"sentToJOUE",
			"tedNoticeNo",
			"versionNumber",
		],
		notice
	)

	const u = notice.isUtilityContract ? "_U" : ""

	if (u) {
		unset(newNotice, `caNoticeEdit_New`)
	} else {
		unset(newNotice, `caNoticeEdit_New_U`)
	}

	unset(newNotice, `caNoticeEdit_New${u}.section0_New`)
	unset(newNotice, `caNoticeEdit_New${u}.annexD_New${u}`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.attentionTo`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.contactPerson`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.contactPoints`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.electronicDocumentsSendingUrl`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.electronicDocumentsSendingUrl`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.email`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.fax`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.nutsCode`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.nutsCodeID`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caAddress.phone`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.caNoticeId`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.canEdit`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.noticePreviousPublication`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.sectionName`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_1.sectionCode`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_2_New`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_4_New`)
	unset(newNotice, `caNoticeEdit_New${u}.section1_New${u}.section1_5`)

	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_1_New${u}.caNoticeId`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_1_New${u}.canEdit`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_1_New${u}.noticePreviousPublication`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_1_New${u}.sectionCode`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_1_New${u}.sectionName`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_1_New${u}.shouldShowSection217`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.caNoticeId`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.canEdit`)

	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.noticePreviousPublication`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.previousPublication`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.sectionCode`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.sectionName`)
	unset(newNotice, `caNoticeEdit_New${u}.section2_New${u}.section2_2_New${u}.showPublishingAgreedSection`)

	newNotice[`caNoticeEdit_New${u}`][`section2_New${u}`][`section2_2_New${u}`].descriptionList.map((lot) => {
		let newLot = unset(lot, `communityProgramReference`)
		newLot = unset(lot, `hasOptions`)
		newLot = unset(lot, `noticeAwardCriteriaList`)
		newLot = unset(lot, `optionsDescription`)
		newLot = unset(lot, `sysEuropeanFund`)
		newLot = unset(lot, `sysEuropeanFundId`)
		newLot = unset(lot, `sysFinancingTypeId`)

		return newLot
	})

	unset(newNotice, `caNoticeEdit_New${u}.section4_New`)
	unset(newNotice, `caNoticeEdit_New${u}.section5`)
	unset(newNotice, `caNoticeEdit_New${u}.section6_New`)

	if (u) {
		newNotice.caNoticeEdit_New_U.section1_New_U.section1_1.caAddress.nationalIDNumberInt = transformFiscalCode(
			newNotice.caNoticeEdit_New_U.section1_New_U.section1_1.caAddress.nationalIDNumber
		)
	} else {
		newNotice.caNoticeEdit_New.section1_New.section1_1.caAddress.nationalIDNumberInt = transformFiscalCode(
			newNotice.caNoticeEdit_New.section1_New.section1_1.caAddress.nationalIDNumber
		)
	}

	return newNotice
}

export function transformNoticeContracts(contracts) {
	return {
		...contracts,
		items: contracts.items.map((item) => {
			const newItem = omit(["actions", "conditions", "hasModifiedVersions", "modifiedCount"], item)
			unset(newItem, "winner.address.attentionTo")
			unset(newItem, "winner.address.contactPerson")
			unset(newItem, "winner.address.contactPoints")
			unset(newItem, "winner.address.email")
			unset(newItem, "winner.address.fax")
			unset(newItem, "winner.address.nutsCode")
			unset(newItem, "winner.address.phone")

			if (newItem.winner) {
				if (newItem.winner.address)
					newItem.winner.address.nationalIDNumberInt = transformFiscalCode(newItem.winner.address.nationalIDNumber)
				newItem.winner.fiscalNumberInt = transformFiscalCode(newItem.winner.fiscalNumber)
			}

			newItem.winners = newItem.winners?.map((winner) => {
				const newWinner = {
					...winner,
					fiscalNumberInt: transformFiscalCode(winner.fiscalNumber),
					address: omit(
						["attentionTo", "contactPerson", "contactPoints", "email", "fax", "nutsCode", "phone"],
						winner.address
					),
				}
				newWinner.address.nationalIDNumberInt = transformFiscalCode(newWinner.address.nationalIDNumber)

				return newWinner
			})

			return newItem
		}),
	}
}

export function transformPublicDirectAcquisition(data) {
	const transformedData = {
		...data,
		directAcquisitionItems: data.directAcquisitionItems.map((item) => {
			delete item.assignedUserEmail
			return item
		}),
	}
	return transformedData
}

export function transformSupplier(supplier) {
	delete supplier.phone
	delete supplier.fax
	delete supplier.url
	delete supplier.email
	delete supplier.address
	delete supplier.bankName
	delete supplier.bankAccount

	return supplier
}

export function transformAuthority(authority) {
	delete authority.phone
	delete authority.fax
	delete authority.url
	delete authority.email
	delete authority.address
	delete authority.bankName
	delete authority.bankAccount

	return authority
}

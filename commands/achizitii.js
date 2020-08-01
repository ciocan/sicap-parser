import React from "react"
import PropTypes from "prop-types"
import { Text } from "ink"

/// Indexeaza achizitiile directe
const Achizitii = ({ data, host }) => <Text>Indexeaza achizitii directe: {data}</Text>

Achizitii.propTypes = {
	/// Data in format zz-ll-aaaa
	data: PropTypes.string.isRequired,
	/// Url Elasticsearch (default localhost:9200)
	host: PropTypes.string,
}

Achizitii.defaultProps = {
	host: "http://localhost:9200",
}

Achizitii.shortFlags = {
	data: "d",
	host: "h",
}

export default Achizitii

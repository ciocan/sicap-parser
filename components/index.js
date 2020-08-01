import React from "react"
import { Text, Box } from "ink"

export const Container = ({ children }) => (
  <Box width={100} flexDirection="column">
    {children}
  </Box>
)

export const Error = ({ text }) => <Text color="red">{text}</Text>

export function Progress({ width = 50, percent = 1 }) {
  let bar = ""
  const completed = percent * 100

  for (let i = 1; i <= width; i++) {
    if (completed >= (i / width) * 100) {
      bar += "="
    } else {
      bar += "-"
    }
  }

  return <Text>{bar}</Text>
}

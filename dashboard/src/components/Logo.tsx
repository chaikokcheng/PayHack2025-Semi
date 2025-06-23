import { Box, Text, HStack } from '@chakra-ui/react'

export function Logo() {
  return (
    <HStack spacing={2}>
      <Box
        w={10}
        h={10}
        bg="linear-gradient(135deg, #ec4899, #0088cc)"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        fontWeight="bold"
        fontSize="lg"
      >
        P
      </Box>
      <Text fontSize="xl" fontWeight="bold" color="pinkpay.600">
        PinkPay
      </Text>
    </HStack>
  )
} 
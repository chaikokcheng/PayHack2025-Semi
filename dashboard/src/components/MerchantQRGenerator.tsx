import {
  Box, Button, VStack, HStack, Text, Input, FormControl, FormLabel, useToast, Badge, Divider, Center, Image
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { FiSquare, FiDownload, FiPlus, FiX, FiCopy } from 'react-icons/fi';

export function MerchantQRGenerator() {
  const [loading, setLoading] = useState(false);
  const [qrData, setQRData] = useState<any>(null);
  const [formData, setFormData] = useState({
    merchant_id: 'PAYHACK_MERCHANT_001',
    merchant_name: 'Restoran Nasi Lemak Antarabangsa',
    description: 'Table Bill',
    currency: 'MYR',
  });
  const [items, setItems] = useState<any[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const qrImageRef = useRef(null);
  const toast = useToast();

  const handleAddItem = () => setItems([...items, { name: '', price: '0', quantity: 1 }]);
  const handleRemoveItem = (idx: any) => setItems(items.filter((_: any, i: number) => i !== idx));
  const handleItemChange = (idx: any, field: any, value: any) => setItems(items.map((item: any, i: number) => i === idx ? { ...item, [field]: value } : item));
  const totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return sum + (price * quantity);
  }, 0);

  const generateQR = async () => {
    // Allow QR generation even with empty items
    const validItems = items.filter(item => item.name.trim() && parseFloat(item.price) > 0);
    
    // If there are items, validate them
    if (items.length > 0 && validItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add valid items with names and prices, or remove all items',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    // Only check total amount if there are items
    if (items.length > 0 && totalAmount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Total amount must be greater than 0 when items are present',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    try {
      const QRCode = (await import('qrcode')).default;
      // Build the QR payload as a JSON object
      const qrPayload: any = {
        qr_code_id: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        merchant_id: formData.merchant_id,
        merchant_name: formData.merchant_name,
        amount: items.length > 0 ? totalAmount : 0,
        currency: formData.currency,
        qr_type: 'merchant',
        is_merchant_menu: true,
        description: formData.description,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        items: validItems
      };
      if (tableNumber) qrPayload.table = tableNumber;
      
      console.log('Generating QR with payload:', qrPayload);
      
      const qrImageDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        width: 256,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      
      const clientQR = {
        qr_code: qrPayload,
        qr_image_base64: qrImageDataUrl,
        qr_id: qrPayload.qr_code_id,
        merchant_id: formData.merchant_id,
        amount: items.length > 0 ? totalAmount : 0,
        currency: formData.currency,
        expiry: qrPayload.expires_at,
        message: 'Webapp QR Code generated successfully'
      };
      
      console.log('QR generated successfully:', clientQR);
      setQRData(clientQR);
      
      toast({
        title: 'Merchant QR Generated',
        description: 'Merchant QR code created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Unable to generate QR code: ' + (error instanceof Error ? error.message : 'Unknown error'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" mt={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="lg">🍽️</Text>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
              Merchant Bill QR Generator
            </Text>
          </HStack>
          <Badge colorScheme="pink" variant="outline">
            New
          </Badge>
        </HStack>
        <Divider />
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm">Merchant ID</FormLabel>
            <Input
              value={formData.merchant_id}
              onChange={e => setFormData({ ...formData, merchant_id: e.target.value })}
              placeholder="Enter merchant ID"
              size="sm"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Merchant Name</FormLabel>
            <Input
              value={formData.merchant_name}
              onChange={e => setFormData({ ...formData, merchant_name: e.target.value })}
              placeholder="Enter merchant name"
              size="sm"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Table Number (optional)</FormLabel>
            <Input value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Table #" size="sm" />
          </FormControl>
          <Box>
            <Text fontWeight="semibold" fontSize="sm" mb={2}>Bill Items (Optional)</Text>
            <VStack spacing={2} align="stretch">
              {items.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  No items added. QR will be generated as a menu-only QR.
                </Text>
              ) : (
                items.map((item, idx) => (
                  <HStack key={idx}>
                    <Input placeholder="Item name" value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} size="sm" />
                    <Input placeholder="Price" type="number" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} size="sm" width="100px" />
                    <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} size="sm" width="60px" />
                    <Button size="xs" colorScheme="red" onClick={() => handleRemoveItem(idx)}><FiX /></Button>
                  </HStack>
                ))
              )}
              <Button size="xs" leftIcon={<FiPlus />} onClick={handleAddItem}>Add Item</Button>
            </VStack>
            {items.length > 0 && (
              <Text fontSize="sm" mt={2}>Total: <b>{totalAmount.toFixed(2)} {formData.currency}</b></Text>
            )}
          </Box>
          <Button
            colorScheme="SatuPay"
            onClick={generateQR}
            isLoading={loading}
            loadingText="Generating..."
            leftIcon={<FiSquare />}
            size="sm"
          >
            Generate Merchant QR
          </Button>
        </VStack>
        {qrData && (
          <VStack spacing={4}>
            <Divider />
            <VStack spacing={3}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Generated Merchant Bill QR
              </Text>
              <Center
                w="280px"
                h="280px"
                bg="white"
                borderRadius="lg"
                border="2px solid"
                borderColor="gray.200"
                shadow="md"
              >
                {qrData.qr_image_base64 ? (
                  <Image
                    ref={qrImageRef}
                    src={qrData.qr_image_base64}
                    alt="Merchant Bill QR Code"
                    maxW="260px"
                    maxH="260px"
                    borderRadius="md"
                    onError={(e) => {
                      console.error('QR image failed to load:', e);
                      toast({
                        title: 'QR Display Error',
                        description: 'QR code generated but failed to display. Check console for details.',
                        status: 'warning',
                        duration: 5000,
                      });
                    }}
                  />
                ) : (
                  <VStack spacing={2}>
                    <Text fontSize="4xl">🍽️</Text>
                    <Text fontSize="xs" color="gray.500">
                      Generating QR Code...
                    </Text>
                  </VStack>
                )}
              </Center>
              
              <VStack spacing={1} align="center">
                <Text fontSize="xs" color="gray.600" fontWeight="semibold">
                  ID: {qrData.qr_id}
                </Text>
                <Text fontSize="sm" color="gray.800" fontWeight="bold">
                  {qrData.currency} {qrData.amount.toFixed(2)}
                </Text>
                {qrData.qr_code.merchant_name && (
                  <Text fontSize="xs" color="gray.600">
                    Merchant: {qrData.qr_code.merchant_name}
                  </Text>
                )}
                {qrData.qr_code.table && (
                  <Text fontSize="xs" color="gray.600">
                    Table: {qrData.qr_code.table}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.600">
                  Type: {items.length > 0 ? 'Merchant Bill' : 'Merchant Menu'}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  Expires: {new Date(qrData.expiry).toLocaleString()}
                </Text>
                {qrData.qr_code.description && (
                  <Text fontSize="xs" color="gray.600">
                    Description: {qrData.qr_code.description}
                  </Text>
                )}
              </VStack>
              <HStack spacing={2}>
                <Button size="xs" leftIcon={<FiDownload />} onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrData.qr_image_base64;
                  link.download = `merchant-bill-qr-${qrData.qr_id}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  Download PNG
                </Button>
                <Button size="xs" leftIcon={<FiCopy />} onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(qrData.qr_code, null, 2));
                }}>
                  Copy Data
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
} 
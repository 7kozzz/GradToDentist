import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    
    // Extract payment data
    const respStatus = formData.get('respStatus')
    const tranRef = formData.get('tranRef')
    const cartId = formData.get('cartId')
    const respMessage = formData.get('respMessage')
    
    console.log('Payment callback received:', {
      respStatus,
      tranRef,
      cartId,
      respMessage
    })
    
    // If payment successful, redirect to payment page with success parameters
    if (respStatus === 'A') {
      const redirectUrl = new URL('/payment', request.url)
      redirectUrl.searchParams.set('success', 'true')
      redirectUrl.searchParams.set('tranRef', tranRef)
      redirectUrl.searchParams.set('cartId', cartId)
      
      return NextResponse.redirect(redirectUrl)
    } else {
      // Payment failed
      const redirectUrl = new URL('/payment', request.url)
      redirectUrl.searchParams.set('success', 'false')
      redirectUrl.searchParams.set('message', respMessage)
      
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(new URL('/payment?error=true', request.url))
  }
}

export async function GET(request) {
  // Handle GET requests (in case PayTabs uses GET)
  const { searchParams } = new URL(request.url)
  const respStatus = searchParams.get('respStatus')
  const tranRef = searchParams.get('tranRef')
  
  if (respStatus === 'A') {
    const redirectUrl = new URL('/payment', request.url)
    redirectUrl.searchParams.set('success', 'true')
    redirectUrl.searchParams.set('tranRef', tranRef)
    
    return NextResponse.redirect(redirectUrl)
  }
  
  return NextResponse.redirect(new URL('/payment', request.url))
}
```

**2. Update PayTabs Success URL to:**
https://gradtodentist.com/api/payment-callback
```

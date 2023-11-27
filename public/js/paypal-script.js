// Initialize PayPal Buttons with configuration
paypal.Buttons({
  // Function to create a new order
  createOrder: function(data, actions) {
      // Return order creation details
      return actions.order.create({
          purchase_units: [{
              // Set the amount for the course to $50.00
              amount: {
                  value: '50.00'
              }
          }]
      });
  },
  
  // Function called when the payment is approved
  onApprove: function(data, actions) {
      // Capture the payment details
      return actions.order.capture().then(function(details) {
          // Display an alert with the payer's name
          alert('Transaction completed by ' + details.payer.name.given_name);
          
          // Call the server to save the transaction
          return fetch('/pay/success', {
              method: 'post',
              headers: {
                  'Content-Type': 'application/json'
              },
              // Send orderID and payerID to the server
              body: JSON.stringify({
                  orderID: data.orderID,
                  payerID: details.payer.payer_id
              })
          });
      });
  }
}).render('#paypal-button-container');

document.addEventListener('DOMContentLoaded', () => {
    const pincodeInput = document.getElementById('pincode');
    const pincodeError = document.getElementById('errorMessage');

    // Function to validate pincode
    const validatePincode = async () => {
        const enteredPincode = pincodeInput.value;
        
        try {
            // Make a fetch request to the backend for pincode validation
            const response = await fetch(`https://delivery-estimation-website.vercel.app/${enteredPincode}`);
            const data = await response.json();

            if (response.ok) {
                if (data.valid) {
                    // Show the delivery estimate if pincode is valid
                    alert(`Delivery Estimate: ${data.deliveryEstimate}`);
                    // Close the modal if valid
                    const myModal = bootstrap.Modal.getInstance(document.getElementById('pincodeModal'));
                    myModal.hide();
                } else {
                    // Show error message if pincode is invalid
                    pincodeError.textContent = 'Invalid Pincode!';
                    pincodeError.style.display = 'block';
                }
            } else {
                throw new Error('Failed to validate pincode');
            }
        } catch (error) {
            // Handle any errors that occur during the fetch request
            pincodeError.textContent = 'Error validating pincode: ' + error.message;
            pincodeError.style.display = 'block';
        }
    };

    // Add event listener for submitting pincode
    document.getElementById('submit-pincode').addEventListener('click', validatePincode);
});

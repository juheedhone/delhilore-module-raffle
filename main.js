document.addEventListener("DOMContentLoaded", function () {
  // Submit Form with validation and inline success message
  const submitForm = document.querySelector(".submit-form");
  const submitButton = submitForm.querySelector('button[type="submit"]');

  // Create success message element
  const successMessage = document.createElement("div");
  successMessage.className = "submit-success-message";
  successMessage.style.display = "none";
  successMessage.innerHTML =
    '<i class="fa-solid fa-circle-check"></i> Thank you for submitting your story! Your submission has been received.';
  submitForm.appendChild(successMessage);

  submitForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form fields
    const name = document.getElementById("name").value.trim();
    const type = document.getElementById("type").value;
    const title = document.getElementById("title").value.trim();
    const desc = document.getElementById("desc").value.trim();
    const image = document.getElementById("image").value.trim();

    // Validate required fields
    let isValid = true;
    let errorMessage = "";

    if (!name) {
      isValid = false;
      errorMessage = "Please enter your name.";
    } else if (!type) {
      isValid = false;
      errorMessage = "Please select a story type.";
    } else if (!title) {
      isValid = false;
      errorMessage = "Please enter a story title.";
    } else if (!desc) {
      isValid = false;
      errorMessage = "Please enter a description.";
    }

    if (!isValid) {
      alert(errorMessage);
      return;
    }

    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;

    setTimeout(() => {
      successMessage.style.display = "block";
      successMessage.style.opacity = "0";
      setTimeout(() => {
        successMessage.style.opacity = "1";
      }, 10);

      submitForm.reset();
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;

      requiredFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        field.style.borderColor = "#ccc";
        field.style.boxShadow = "none";
      });

      setTimeout(() => {
        successMessage.style.opacity = "0";
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 300);
      }, 5000);
    }, 1000);
  });

  const requiredFields = ["name", "type", "title", "desc"];
  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", function () {
      const value = this.value.trim();
      if (!value) {
        this.style.borderColor = "var(--payment-error)";
        this.style.boxShadow = "0 0 0 0.2rem rgba(220, 53, 69, 0.25)";
      } else {
        this.style.borderColor = "var(--success-green)";
        this.style.boxShadow = "0 0 0 0.2rem rgba(40, 167, 69, 0.25)";
      }
    });

    field.addEventListener("input", function () {
      const value = this.value.trim();
      if (value) {
        this.style.borderColor = "var(--success-green)";
        this.style.boxShadow = "0 0 0 0.2rem rgba(40, 167, 69, 0.25)";
      } else {
        this.style.borderColor = "#ccc";
        this.style.boxShadow = "none";
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        if (targetId === "payments") {
          target.classList.add("highlight-payments");
          setTimeout(() => {
            target.classList.remove("highlight-payments");
          }, 1200);
        }
      }
    });
  });

  // Payment stepper logic with Stripe integration
  const paymentCards = document.querySelectorAll(".payment-card");
  const stepChoose = document.getElementById("payment-step-choose");
  const stepDetails = document.getElementById("payment-step-details");
  const stepSuccess = document.getElementById("payment-step-success");
  const paymentFormTitle = document.getElementById("payment-form-title");
  const paymentSubmitBtn = document.getElementById("payment-submit-btn");
  const paymentErrorMessage = document.getElementById("payment-error-message");
  const paymentErrorText = document.getElementById("payment-error-text");
  const cardFields = document.getElementById("card-fields");
  const upiFields = document.getElementById("upi-fields");
  const gpayFields = document.getElementById("gpay-fields");
  const applepayFields = document.getElementById("applepay-fields");
  const cardErrors = document.getElementById("card-errors");
  const cardErrorText = document.getElementById("card-error-text");

  const mockStripe = {
    elements: function () {
      return {
        create: function (type, options) {
          return {
            mount: function (selector) {
              const container = document.querySelector(selector);
              if (container) {
                container.innerHTML = `
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <input type="text" placeholder="Card Number" style="padding: 0.7rem; border: 1px solid #ccc; border-radius: 4px; font-size: 16px;" id="mock-card-number">
                    <div style="display: flex; gap: 0.5rem;">
                      <input type="text" placeholder="MM/YY" style="padding: 0.7rem; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; flex: 1;" id="mock-card-expiry">
                      <input type="text" placeholder="CVC" style="padding: 0.7rem; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; flex: 1;" id="mock-card-cvc">
                    </div>
                  </div>
                `;
                const cardNumber = document.getElementById("mock-card-number");
                const cardExpiry = document.getElementById("mock-card-expiry");
                const cardCvc = document.getElementById("mock-card-cvc");
                [cardNumber, cardExpiry, cardCvc].forEach((input) => {
                  input.addEventListener("input", validateCardFields);
                  input.addEventListener("blur", validateCardFields);
                });
              }
            },
            on: function (event, callback) {
              this.validationCallback = callback;
            },
          };
        },
        clear: function () {
          const container = document.querySelector("#card-element");
          if (container) {
            container.innerHTML = "";
          }
        },
      };
    },
  };

  function validateCardFields() {
    const cardNumber = document.getElementById("mock-card-number");
    const cardExpiry = document.getElementById("mock-card-expiry");
    const cardCvc = document.getElementById("mock-card-cvc");
    let hasError = false;
    let errorMessage = "";
    if (cardNumber && cardNumber.value.length < 13) {
      hasError = true;
      errorMessage = "Card number is incomplete";
    } else if (cardExpiry && !/^\d{2}\/\d{2}$/.test(cardExpiry.value)) {
      hasError = true;
      errorMessage = "Expiry date must be in MM/YY format";
    } else if (cardCvc && cardCvc.value.length < 3) {
      hasError = true;
      errorMessage = "CVC must be at least 3 digits";
    }
    if (hasError) {
      showCardError(errorMessage);
    } else {
      hideCardError6();
    }
  }

  function showPaymentError(message) {
    paymentErrorText.textContent = message;
    paymentErrorMessage.style.display = "flex";
    paymentErrorMessage.style.opacity = "0";
    setTimeout(() => {
      paymentErrorMessage.style.opacity = "1";
    }, 10);
  }

  function hidePaymentError() {
    paymentErrorMessage.style.opacity = "0";
    setTimeout(() => {
      paymentErrorMessage.style.display = "none";
    }, 300);
  }

  function showCardError(message) {
    cardErrorText.textContent = message;
    cardErrors.style.display = "flex";
    cardErrors.style.opacity = "0";
    setTimeout(() => {
      cardErrors.style.opacity = "1";
    }, 10);
  }

  function hideCardError() {
    cardErrors.style.opacity = "0";
    setTimeout(() => {
      cardErrors.style.display = "none";
    }, 300);
  }

  function setPaymentLoading(loading) {
    if (loading) {
      paymentSubmitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      paymentSubmitBtn.disabled = true;
    } else {
      paymentSubmitBtn.innerHTML =
        '<i class="fa-solid fa-credit-card"></i> Pay Now';
      paymentSubmitBtn.disabled = false;
    }
  }

  function initializeStripeElements() {
    const elements = mockStripe.elements();
    const cardElement = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
    });
    cardElement.mount("#card-element");
  }

  paymentCards.forEach(function (card) {
    card.addEventListener("click", function () {
      paymentCards.forEach((c) => c.classList.remove("selected"));
      this.classList.add("selected");
      stepChoose.style.display = "none";
      stepDetails.style.display = "block";
      stepSuccess.style.display = "none";
      hidePaymentError();
      hideCardError();
      cardFields.style.display = "none";
      upiFields.style.display = "none";
      gpayFields.style.display = "none";
      applepayFields.style.display = "none";
      const method = this.getAttribute("data-method");
      if (method === "visa" || method === "mastercard" || method === "amex") {
        paymentFormTitle.innerHTML = `<i class="fa-solid fa-credit-card"></i> Enter your card details:`;
        cardFields.style.display = "block";
        setTimeout(() => {
          initializeStripeElements();
        }, 100);
      } else if (method === "upi") {
        paymentFormTitle.innerHTML = `<i class="fa-solid fa-building-columns"></i> Enter your UPI ID:`;
        upiFields.style.display = "block";
      } else if (method === "gpay") {
        paymentFormTitle.innerHTML = `<i class="fa-brands fa-google-pay"></i> Pay with Google Pay:`;
        gpayFields.style.display = "block";
      } else if (method === "applepay") {
        paymentFormTitle.innerHTML = `<i class="fa-brands fa-apple-pay"></i> Pay with Apple Pay:`;
        applepayFields.style.display = "block";
      }
    });
  });

  stepDetails.addEventListener("submit", function (e) {
    e.preventDefault();
    hidePaymentError();
    hideCardError();
    const selectedCard = document.querySelector(".payment-card.selected");
    if (!selectedCard) {
      showPaymentError("Please select a payment method.");
      return;
    }
    const method = selectedCard.getAttribute("data-method");
    setPaymentLoading(true);
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      if (isSuccess) {
        stepDetails.style.display = "none";
        stepSuccess.style.display = "block";
        setPaymentLoading(false);
        setTimeout(() => {
          stepSuccess.style.display = "none";
          stepChoose.style.display = "block";
          paymentCards.forEach((c) => c.classList.remove("selected"));
          stepDetails.reset();
          hidePaymentError();
          hideCardError();
        }, 3000);
      } else {
        setPaymentLoading(false);
        showPaymentError("❌ Payment failed. Please try again.");
        if (method === "visa" || method === "mastercard" || method === "amex") {
          showCardError(
            "❌ Payment failed. Please check your card details and try again."
          );
        }
      }
    }, 2000);
  });
});

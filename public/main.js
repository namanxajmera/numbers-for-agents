(function () {
  function bindWaitlistForms() {
    document.querySelectorAll("[data-waitlist-form]").forEach(function (form) {
      if (form.dataset.bound === "true") return;
      form.dataset.bound = "true";

      var emailInput = form.querySelector('input[type="email"]');
      var messageEl = form.querySelector("[data-form-message]");
      var submitBtn = form.querySelector('button[type="submit"]');
      var source = form.getAttribute("data-source") || "landing";

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!emailInput || !messageEl) return;

        var email = emailInput.value.trim();
        messageEl.textContent = "";
        messageEl.className = "form-message";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          messageEl.textContent = "Enter a valid email address.";
          messageEl.classList.add("error");
          emailInput.focus();
          return;
        }

        var hp = form.querySelector('input[name="company"]');
        var body = {
          email: email,
          source: source,
          company: hp ? hp.value : "",
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Joining…";
        }

        fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
          .then(function (res) {
            return res.json().then(function (data) {
              return { ok: res.ok, data: data };
            });
          })
          .then(function (result) {
            if (result.ok && result.data.ok) {
              messageEl.textContent =
                "You are on the list. We will email you when access opens.";
              messageEl.classList.add("success");
              form.reset();
            } else {
              messageEl.textContent =
                (result.data && result.data.error) ||
                "Something went wrong. Try again.";
              messageEl.classList.add("error");
            }
          })
          .catch(function () {
            messageEl.textContent = "Network error. Try again.";
            messageEl.classList.add("error");
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Join the waitlist";
            }
          });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindWaitlistForms);
  } else {
    bindWaitlistForms();
  }
})();

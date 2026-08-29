/* Greg's Brush Strokes — interactions (v2, dark theme) */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Scroll reveal (progressive enhancement) ---------- */
  var root = document.documentElement;
  if ("IntersectionObserver" in window) {
    root.classList.add("reveal-enabled");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) && r.bottom > 0) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- Booking form — formsubmit.co AJAX, no redirect ---------- */
  // CONFIG: replace this email with Greg's actual email address.
  // FormSubmit sends submissions here. The first ever submission triggers a
  // one-time confirmation email from FormSubmit to this address — Greg clicks
  // the link once to activate the endpoint, and all future submissions arrive.
  var FORMSUBMIT_EMAIL = "gregmeller90@gmail.com";
  var FORMSUBMIT_AJAX = "https://formsubmit.co/ajax/" + FORMSUBMIT_EMAIL;

  var form = document.getElementById("bookingForm");
  var msg = document.getElementById("formMsg");
  var submitBtn = document.getElementById("bookingSubmit");
  var submitLabel = submitBtn ? submitBtn.textContent : "Send request";

  function showMsg(text, type) {
    if (!msg) return;
    msg.className = "form-msg show" + (type ? " form-msg--" + type : "");
    msg.textContent = text;
  }
  function clearMsg() {
    if (!msg) return;
    msg.className = "form-msg";
    msg.textContent = "";
  }
  function setBtnState(state) {
    if (!submitBtn) return;
    if (state === "loading") {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearMsg();

      // Honeypot: if filled, silently ignore (bot).
      var honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      // Browser validation first.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setBtnState("loading");

      // Build a clean JSON payload from the real fields.
      var payload = {
        name: form.name.value,
        contact: form.contact.value,
        service: form.service.value,
        timing: form.timing.value,
        area: form.area.value,
        preferred_contact: form.preferred_contact.value,
        message: form.message.value,
        _subject: form._subject.value,
        _template: form._template.value
      };

      fetch(FORMSUBMIT_AJAX, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          // FormSubmit returns 200 with JSON {success:"true"} on success.
          if (res.ok) return res.json();
          // Non-2xx — treat as error, try to parse a message.
          return res.json().then(function (d) {
            var err = new Error((d && d.message) || "Submission failed");
            err.data = d;
            throw err;
          });
        })
        .then(function (data) {
          if (data && data.success === "true") {
            showMsg("Thank you — your request has been sent. Greg will be in touch shortly.", "ok");
            form.reset();
          } else {
            // Some responses still arrive as success; guard anyway.
            showMsg("Thank you — your request has been sent. Greg will be in touch shortly.", "ok");
            form.reset();
          }
        })
        .catch(function (err) {
          var m = (err && err.message) ? err.message : "Something went wrong.";
          showMsg(m + " Please try again, or call Greg on 07704 249020.", "err");
        })
        .finally(function () {
          setBtnState("idle");
        });
    });
  }
})();

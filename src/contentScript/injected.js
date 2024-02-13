(function (xhr) {
  var XHR = XMLHttpRequest.prototype;

  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = new Date().toISOString();

    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function (header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function (postData) {
    this.addEventListener("load", function () {
      var endTime = new Date().toISOString();

      var myUrl = this._url ? this._url.toLowerCase() : this._url;
      let u = null;
      try {
        u = new URL(this._url);
      } catch (error) {
        //console.log(error?.message);
      }
      if (myUrl && u && u.pathname.endsWith("i/fd")) {
        if (postData) {
          if (typeof postData === "string") {
            try {
              // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
              this._requestHeaders = postData;
            } catch (err) {
              console.log(
                "Request Header JSON decode failed, transfer_encoding field could be base64"
              );
              console.log(err);
            }
          } else if (
            typeof postData === "object" ||
            typeof postData === "array" ||
            typeof postData === "number" ||
            typeof postData === "boolean"
          ) {
            // do something if you need
          }
        }

        // here you get the RESPONSE HEADERS
        var responseHeaders = this.getAllResponseHeaders();

        if (this.responseType != "blob" && this.responseText) {
          // responseText is string or null
          try {
            // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
            var arr = this.responseText;
            const emailData = parseEmail(JSON.parse(arr));
            window.postMessage({ type: "FROM_PAGE", payload: emailData });
          } catch (err) {
            console.log("Error in responseType try catch");
            console.log(err);
          }
        }
      }
    });

    return send.apply(this, arguments);
  };

  function parseEmail(json) {
    let thread_root = json["1"];
    if (!thread_root || !Array.isArray(thread_root)) {
      return null;
    }

    try {
      const emailData = {};
      const fd_threads = thread_root; // array
      for (let fd_thread_container of fd_threads) {
        const fd_thread_id = fd_thread_container["0"];

        let fd_emails = fd_thread_container["2"]; // array
        for (let fd_email of fd_emails) {
          const fd_email_subject = fd_email["1"]["4"];
          const fd_email_id = fd_email["0"];
          const fd_legacy_email_id = fd_email["1"]["34"];
          const emailHTMLBody = parse_fd_request_html_payload(fd_email);

          if (!emailData[fd_thread_id]) {
            emailData[fd_thread_id] = [];
          }
          emailData[fd_thread_id].push({
            id: fd_email_id,
            threadId: fd_thread_id,
            legacyId: fd_legacy_email_id,
            subject: fd_email_subject,
            body: emailHTMLBody,
          });
          // if(document.querySelector('[role="main"] [data-thread-perm-id]')){
          // window.postMessage({type: "FROM_PAGE", payload:
          // {
          //     id: fd_email_id,
          //     threadId: fd_thread_id,
          //     legacyId: fd_legacy_email_id,
          //     subject: fd_email_subject,
          //     body: emailHTMLBody
          // }});
          //console.log('Someones replying to thread....', fd_email_subject);
          // }
        }
      }
      return emailData;
    } catch (error) {
      console.warn("Gmail parse Failed: ## ", error);
    }
    return null;
  }

  parse_fd_request_html_payload = function (fd_email) {
    let fd_email_content_html = null;
    try {
      const fd_html_containers = fd_email["1"]["5"]["1"];
      fd_email_content_html =
        (fd_email_content_html || "") + fd_html_containers[0]["2"]["1"];
    } catch (e) {}
    return fd_email_content_html;
  };
})(XMLHttpRequest);

import { htmlToText } from "html-to-text";
import { getBuddyToken, getRefreshCookie } from "../utils/storage";

function convertHtmlToText(html) {
  return htmlToText(html, {
    wordwrap: 100,
    ignoreImage: true, // Ignore images
    ignoreHref: true,
    hideLinkHrefIfSameAsText: true,
  });
}

function removeUrls(text) {
  // Regular expression to match URLs
  const urlRegex = /(\[?https?:\/\/[^\s]+)/g;

  // Replace URLs with an empty string
  return text.replace(urlRegex, "");
}

function findMsgThread(data: any, threadId: string, msgId: string) {
  return Object.values(data).find(
    (obj: any) => obj.threadId === threadId && obj.id === msgId
  );
}

// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  // setStoredCities([]);
  // chrome.storage.local.set({ emailData: "" }, function () {
  //   console.log("Email Data Init With Empty");
  // });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.id && request?.body) {
    getBuddyToken("token").then((accessToken) => {
      let text = convertHtmlToText(request.body);
      text = removeUrls(text).replace(/\n+/g, "");

      fetch("http://localhost:8002/api/mail/reply", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify({email: text })
      })
        .then(async(r: any) => {
          console.log(r);
          r = await r.json();
          console.log(r);
          sendResponse(r.template);
        })
        .catch((e) => sendResponse({ err: e.message }));
    });
  }else if(request?.setRToken){
    getRefreshCookie().then((token) =>{
      sendResponse(token);
    }).catch((e) => sendResponse({ err: e.message }));;
  }

  return true;
});

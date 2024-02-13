import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactShadowRoot from "react-shadow-root";
import { setBuddyToken } from "../utils/storage";
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "reply-buddy": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "reply-buddy-container": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const emailDataToStore: Map<string, Array<any>> = new Map();

window.addEventListener("message", async function (event) {
  if (
    event.data.type &&
    event.data.type === "FROM_PAGE" &&
    typeof chrome.runtime !== "undefined"
  ) {
    const newEmailData = event.data.payload ?? null;
    if (newEmailData) {
      const threadIds = Object.keys(newEmailData);
      if (threadIds.length) {
        threadIds.forEach((threadId) => {
          if (!emailDataToStore.has(threadId)) {
            // If it doesn't exist, add a new entry for the threadId
            emailDataToStore.set(threadId, newEmailData[threadId]);
          }
        });
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const ReplyBuddyExtension: React.FC<{}> = () => {
    useEffect(() => {
      window.addEventListener("message", async function (event) {
        if (
          event.data.type &&
          event.data.type === "REPLY_BUDDY_AUTH" &&
          typeof chrome.runtime !== "undefined"
        ) {
          console.log("Reply Buddy Container is handling message", event?.data);
          if (event?.data?.accessToken) {
            chrome.runtime.sendMessage(
              null,
              { setRToken: true },
              async (rToken) => {
                if (rToken) {
                  console.log(rToken);
                  await setBuddyToken(event?.data?.accessToken, "token");
                  await setBuddyToken(rToken, "rToken");
                }
              }
            );
          } else {
            console.log("Buddy tkn not found");
          }
        }
      });
    }, []);

    return (
      <reply-buddy-container>
        {/* @ts-expect-error Server Component */}
        <ReactShadowRoot>
            <div className="reply-buddy-container-parent"></div>
        </ReactShadowRoot>
      </reply-buddy-container>
    );
  };
  const containerRoot = document.createElement("div");
  document.body.appendChild(containerRoot);
  document.body.insertAdjacentElement("afterend", containerRoot);
  ReactDOM.render(<ReplyBuddyExtension />, containerRoot);

  // Run your code here...
  const styles = `
      :host {
        border: 2px dashed blue;
      }
      
      button {
        padding: 7px;
        font-weight: bolder;
        background-color: #ffc01c;
        border: 0.5px solid currentColor;
        border-radius: 30px;
        cursor: pointer;
        outline: 0;
        inset: 0px auto auto 0px;
        display: none;
      }
      span{
        color: black;
        background-color: gray;
      }

      .reply-btn-parent{
        z-index: 2147483647;
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
      }

      .modal-background {
        width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
          position: fixed;
          top: 0;
          left: 0;
          display: none;
          z-index: 9998;
      }
      .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          display: none;	
          width: 750px;
          height: 300px;
          background-color: #fff;
          box-sizing: border-box;
          border-radius: 5px;
          z-index: 9999;
      }
      .modal > p {
        padding: 15px;
          margin: 0;
      }
      .modal-header {
        background-color: #f9f9f9;
        border-bottom: 1px solid #dddddd;
        box-sizing: border-box;
        height: 50px;
        border-radius: 5px;
        font-family: 'Roboto';
      }
      .modal-header h3 {
        margin: 0;
        box-sizing: border-box;
        padding-left: 15px;
        line-height: 50px;
        color: #4d4d4d;
        font-size: 16px;
        display: inline-block;
      }
      .modal-header label {
        box-sizing: border-box;
          border-left: 1px solid #dddddd;
          float: right;
          line-height: 50px;
          padding: 0 15px 0 15px;
          cursor: pointer;
      }
      .modal-header label:hover img {
        opacity: 0.6;
      }

      #modal-content {
        font-family: 'Roboto';
        padding: 40px;
        overflow-y: scroll;
        height: 387px;
        background-color: white;
      }
    `;

  const App: React.FC<{}> = () => {
    const [openTemplateDrawer, setOpenTemplateDrawer] = useState(false);

    const openTemplateDrawerHandler = (action = null) => {
      setOpenTemplateDrawer(!openTemplateDrawer);
      const shadowRoot =
        document.getElementsByTagName("reply-buddy")[0]?.shadowRoot;
      if (shadowRoot) {
        const modalContentEle = shadowRoot.getElementById(
          "modal-content"
        ) as HTMLElement;
        const elements = shadowRoot.querySelectorAll(".replyBModal");
        // Iterate over the selected elements and apply the display: block style
        elements.forEach((element: HTMLElement) => {
          element.style.display =
            element.style.display !== "block" ? "block" : "none";
        });

        if (action === "open") {
          const threadPermElement = document.querySelector(
            '[role="main"] [data-thread-perm-id]'
          ) as HTMLElement;
          const threadDataset = threadPermElement.dataset;
          const threadId = threadDataset.threadPermId;
          const threadInfo = emailDataToStore.get(threadId);
          const msgId =
            (
              document.getElementsByName("rm")[0] as HTMLInputElement
            )?.value?.slice(1) ?? null;
          if (!msgId) return;
          const msgInfo = threadInfo.find((m) => m.id === msgId);
          console.log(msgInfo);
          chrome.runtime.sendMessage(null, msgInfo, (response) => {
            modalContentEle.innerHTML = response;
          });
        }
      } else {
        console.log("Can't find the shadow root");
      }
    };

    return (
      <reply-buddy>
        {/* @ts-expect-error Server Component */}
        <ReactShadowRoot>
          <div className="reply-btn-parent">
            <style>{styles}</style>
            <button
              id="reply-buddy-btn"
              onClick={() => {
                openTemplateDrawerHandler("open");
              }}
            >
              Reply Buddy
            </button>
            <label
              htmlFor="modal"
              className="replyBModal modal-background"
            ></label>
            <div className="replyBModal modal">
              <div className="modal-header">
                <h3>Reply Templates</h3>
                <label htmlFor="modal" onClick={openTemplateDrawerHandler}>
                  ❌
                </label>
              </div>
              <div id="modal-content">
                <p>Loading....</p>
              </div>
            </div>
          </div>
        </ReactShadowRoot>
      </reply-buddy>
    );
  };
  const root = document.createElement("div");
  document.body.appendChild(root);

  async function handleContentEditableChange(mutationsList) {
    for (let mutation of mutationsList) {
      const mutationElement = mutation as MutationRecord;
      const target = mutationElement.target as HTMLElement;
      if (target.isContentEditable) {
        const messageEle = document.querySelector(
          "[data-message-id]"
        ) as HTMLElement;
        const messageID = messageEle.dataset?.messageId;
        if (messageID) {
          const threadPermElement = document.querySelector(
            '[role="main"] [data-thread-perm-id]'
          ) as HTMLElement;
          const threadDataset = threadPermElement.dataset;
          const threadId = threadDataset.threadPermId;
          const emailInfo = emailDataToStore.get(threadId);
          if (emailInfo) {
            const formParent =
              document.querySelector("[name='subject']").parentElement;
            const bounds = target.getBoundingClientRect();
            document.body.insertAdjacentElement("afterend", root);
            ReactDOM.render(<App />, root);

            setTimeout(() => {
              const shadowRoot =
                document.getElementsByTagName("reply-buddy")[0]?.shadowRoot; 
              if (shadowRoot) {
                const rBtn = shadowRoot.getElementById("reply-buddy-btn");
                if (rBtn) {
                  rBtn.style.display = `block`;
                  rBtn.style.transform = `translate(${bounds.left + 10}px, ${
                    bounds.top + 60
                  }px)`;

                  document
                    .getElementById(":3")
                    .addEventListener("scroll", () => {
                      rBtn.style.transform = `translate(${target.getBoundingClientRect().left + 10}px, ${
                        target.getBoundingClientRect().top + 60
                      }px)`;
                    });

                  target.addEventListener("keyup", (e) => {
                    if ((e.target as HTMLElement).textContent.length > 0) {
                      rBtn.style.display = `none`;
                    } else {
                      rBtn.style.display = `block`;
                    }
                  });

                  const targetObserve = new MutationObserver(
                    (mutationsList) => {
                      const shadowRoot =
                        document.getElementsByTagName("reply-buddy")[0]
                          ?.shadowRoot;
                      const rBtn = shadowRoot.getElementById("reply-buddy-btn");
                      if (
                        mutationsList.length &&
                        !document.querySelector("[name='subject']")
                      ) {
                        rBtn.style.display = `none`;
                        console.log(
                          "Disconnecting observer as user is not replying"
                        );
                        targetObserve.disconnect();
                      }
                    }
                  );
                  targetObserve.observe(target, {
                    attributes: true,
                  });
                } else {
                  console.error(
                    "Reply button not found inside the shadow root"
                  );
                }
              } else {
                console.error("Shadow root not found");
              }
            }, 0);
          } else {
            console.log("Email Info Not Found...");
          }
        }
        console.log("**** FOUND YOUR CONTENTEDitable");
      }
    }
  }

  // Create a new MutationObserver to watch for changes in contenteditable attribute
  const observer = new MutationObserver(handleContentEditableChange);

  // Start observing the document for changes
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["contenteditable"],
  });
});

function isUserReplying(element: HTMLElement): boolean {
  const t = element.closest("[role=list]");
  return !!t && !!t.querySelector("[data-message-id]");
}

function isReplyPopUp(element: HTMLElement): boolean {
  const n = element.closest('[style*="float"]');
  const t = element;
  return (
    !!n &&
    !(!t.ownerDocument || !t.ownerDocument.defaultView) &&
    "right" === t.ownerDocument.defaultView.getComputedStyle(n).cssFloat
  );
}

/* 

document.querySelector('[data-message-id]').dataset.messageId

document.querySelector('[data-message-id="'+document.querySelector('[data-message-id]').dataset.messageId
+'"] [jslog] > div[id^=":"]')

*/

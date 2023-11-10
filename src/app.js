document.addEventListener("DOMContentLoaded", () => {
  //Scroll to bottom on every start
  const chatBox = document.getElementById("chatting");

  //Always open chat-tab first
  const chatTab = document.getElementById("tab-chatting");
  const tabButton = document.getElementById("chat");
  chatTab.style.display = "block";
  tabButton.setAttribute("class", "tablinks active");
  //Create arrays for message history
  let sentHistory = [];
  let answerHistory = [];

  //IIFE to save messages from local storage into arrays
  (function getHistory() {
    //Save messages into arrays if local storage is not empty and print them
    if (localStorage.getItem("receivedMessages") !== null) {
      sentHistory = JSON.parse(localStorage.getItem("sentMessages"));
      answerHistory = JSON.parse(localStorage.getItem("receivedMessages"));
      printHistory();
    }
  })();

  function printHistory() {
    //Print messages into individual speech bubbles alternately
    for (let i = 0; i < sentHistory.length; i++) {
      printPrompt(sentHistory[i]);
      printAnswer(answerHistory[i]);
    }
  }

  //Check parameter for sent or received message and save it into local storage
  function saveToHistory(arr) {
    if (arr === sentHistory) {
      localStorage.setItem("sentMessages", JSON.stringify(arr));
    } else if (arr === answerHistory) {
      localStorage.setItem("receivedMessages", JSON.stringify(arr));
    }
  }

  const tabButtons = document.querySelectorAll(".tablinks");

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", (e) => {
      let i, tabcontent, tablinks;

      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      // Get all elements with class="tablinks" and remove the class "active"
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show the current tab, and add an "active" class to the button that opened the tab
      switch (index) {
        case 0:
          document.getElementById("tab-chatting").style.display = "block";
          break;
        case 1:
          document.getElementById("tab-settings").style.display = "block";
          break;
        case 2:
          document.getElementById("tab-information").style.display = "block";
          break;
        default:
          break;
      }

      e.currentTarget.className += " active";
    });
  });

  function printAnswer(answerString) {
    //Create div element and save chat window into variable
    const speechBubble = document.createElement("div");
    //Add two classes, speech and left
    speechBubble.setAttribute("class", "speech left");
    //If answerString is empty, set loader id for removing element later
    if (answerString === "") {
      speechBubble.setAttribute("id", "loader");
    }
    //Create textnode and append it into speechbubble
    const msgString = document.createTextNode(answerString);
    speechBubble.appendChild(msgString);
    //Append speech bubble into chat box and scroll to bottom
    chatBox.appendChild(speechBubble);
    chatBox.scrollTo(0, chatBox.scrollHeight);
  }

  function printPrompt(prompt) {
    //Create div element and text node of prompt and insert text node into div
    const speechBubble = document.createElement("div");
    const msgPrompt = document.createTextNode(prompt);
    speechBubble.appendChild(msgPrompt);
    //Set classes for speech bubble and insert speech bubble into chat window
    speechBubble.setAttribute("class", "speech right");
    chatBox.appendChild(speechBubble);
  }

  function loadingElement() {
    //Create empty speech bubble
    printAnswer("");
    //Create div and set id
    const loadingDiv = document.createElement("div");
    loadingDiv.setAttribute("id", "loading");
    //Create <p> element and set class load-text
    const loadingText = document.createElement("p");
    loadingText.setAttribute("class", "load-text");
    //Create textnode and append it into <p> element
    const text = document.createTextNode("Kirjoittaa");
    loadingText.appendChild(text);
    //Append <p> element into div (loading element)
    loadingDiv.appendChild(loadingText);
    //Append loading div into speech bubble
    const speechBubble = document.getElementById("loader");
    speechBubble.appendChild(loadingDiv);
    //Scroll chat window to bottom
    chatBox.scrollTo(0, chatBox.scrollHeight);
  }

  //Create role variable and save elements into variables
  let role;
  const roleName = document.getElementById("chosenRole");
  const removeRoleBtn = document.getElementById("removeRole");

  //Check local storage for role
  if (localStorage.getItem("role") === null) {
    role = "";
  } else {
    //Role found = role name and button visible
    role = localStorage.getItem("role");
    removeRoleBtn.style.visibility = "visible";
    roleName.innerText = `Valittu rooli: ${role}`;
  }

  //Save button into variable and add event listener
  const roleBtn = document.getElementById("chooseRole");
  roleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    //Grab role name and save it into local storage
    role = document.getElementById("rolename").value;
    localStorage.setItem("role", role);
    //If input is empty, show alert
    if (role === "") {
      alert("Kirjoita jokin rooli!");
    } else {
      /*If role is chosen, make role removal button visible,
      print chosen role and reset input field*/
      removeRoleBtn.style.visibility = "visible";
      roleName.innerText = `Valittu rooli: ${role}`;
      document.getElementById("rolename").value = "";
    }
  });
  //Listener for role removal button
  removeRoleBtn.addEventListener("click", () => {
    /*Remove role from local storage
    hide button, set no_role as role, empty printed role*/
    localStorage.removeItem("role");
    removeRoleBtn.style.visibility = "hidden";
    role = "no_role";
    roleName.innerText = ``;
  });

  let messages = [];
  const message = document.getElementById("message");
  const submitBtn = document.getElementById("send");
  //"Lähetä" napille funktio, joka lähettää viestin apiin ja palauttaa vastauksen
  submitBtn.addEventListener("click", (e) => {
    if (message.value === "") {
      alert("Kirjoita jotain");
    } else {
      printPrompt(message.value);
      loadingElement();
      sentHistory.push(message.value);
      saveToHistory(sentHistory);
      e.preventDefault();
      let messageText = `${message.value}`;

      //If role is not empty, modify prompt
      if (role != "") {
        //If role is "no_role", modify it once for resetting role
        if (role === "no_role") {
          messageText = `Vastaa ilman roolia: ${message.value}`;
          role = "";
        } else messageText = `Vastaa kuin olisit ${role}: ${message.value}`;
      }

      console.log(messageText);
      const newMessage = { role: "user", content: `${messageText}` };
      messages.push(newMessage);
      message.value = "";

      //Send and return messages from API
      fetch("http://localhost:3000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          let newAssistantMessage = {
            role: "assistant",
            content: `${data.completion.content}`,
          };
          messages.push(newAssistantMessage);
          //Remove element with loader id
          document.getElementById("loader").remove();
          printAnswer(data.completion.content);
          answerHistory.push(data.completion.content);
          saveToHistory(answerHistory);
        });
    }
  });

  const themeButton = document.getElementById("themeChange");
  //On click, change theme
  themeButton.addEventListener("click", () => {
    if (localStorage.getItem("theme") === "theme-dark") {
      setTheme("theme-light");
    } else {
      setTheme("theme-dark");
    }
  });

  // function to set a given theme/color-scheme
  function setTheme(themeName) {
    localStorage.setItem("theme", themeName);
    document.documentElement.className = themeName;
  }

  // Immediately invoked function to set the theme on initial load
  (function () {
    if (
      localStorage.getItem("theme") === "theme-dark" ||
      localStorage.getItem("theme") === null
    ) {
      setTheme("theme-dark");
    } else {
      setTheme("theme-light");
    }
  })();

  //Save button and chatbox into variables and add event listener
  const emptyButton = document.getElementById("emptyChat");
  const chatContainer = document.getElementById("chatting");
  emptyButton.addEventListener("click", () => {
    //Ask user to confirm message history deletion
    if (confirm("Haluatko varmasti poistaa kaikki viestit?")) {
      //Remove all child nodes from chatbox and empty arrays
      removeAllChildNodes(chatContainer);
      sentHistory = [];
      answerHistory = [];
      //Clear localstorage messages
      localStorage.removeItem("sentMessages");
      localStorage.removeItem("receivedMessages");
    } else {
      console.log("Viestejä ei poistettu :)");
    }
  });

  //Function to loop through child elements and remove them all
  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
});

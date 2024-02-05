document.addEventListener("DOMContentLoaded", function () {
    
    const APIKEY = "65b83268bd7b9b4295737c6b";
    getContacts();
    document.getElementById("update-userinfo-container").style.display = "none";
    document.getElementById("add-update-msg").style.display = "none";
  
    //[STEP 1]: Create our submit form listener
    document.getElementById("userinfo-submit").addEventListener("click", function (e) {
      // Prevent default action of the button 
      e.preventDefault();
   
      //[STEP 2]: Let's retrieve form data
      // For now, we assume all information is valid
      // You are to do your own data validation
      let infoUsername = document.getElementById("userinfo-username").value;
      let infoEmail = document.getElementById("userinfo-email").value;
      let infoPassword = document.getElementById("userinfo-password").value;

      checkUniqueness(infoUsername, infoEmail, function (isUnique) {
        if (isUnique) {
            // If both username and email are unique, proceed with the form submission
            submitForm(infoUsername, infoEmail, infoPassword);
        } 
        
        else {
            // Display an error message or handle the duplicate case as needed
            alert('Username or Email is already taken. Please choose different ones.');
        }
    });

    function checkUniqueness(username, email, callback) {
      // Check uniqueness using an API call or any other method
      // You need to adapt this part based on your backend/API structure
      let settings = {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "x-apikey": APIKEY,
              "Cache-Control": "no-cache"
          },
      };
  
      fetch(`https://salvagedsavings-713c.restdb.io/rest/userinfo?q={"$or":[{"username":"${username}"},{"email":"${email}"}]}`, settings)
          .then(response => response.json())
          .then(response => {
              // If the response is empty, it means both username and email are unique
              const isUnique = response.length === 0;
              callback(isUnique);
          })
          .catch(error => {
              console.error('Error checking uniqueness:', error);
              // Handle the error case appropriately
              callback(false);
          });
    }

      //[STEP 3]: Get form values when the user clicks on send
      // Adapted from restdb API
      let jsondata = {
        "username": infoUsername,
        "email": infoEmail,
        "password": infoPassword
      };
  
      //[STEP 4]: Create our AJAX settings. Take note of API key
      let settings = {
        method: "POST", //[cher] we will use post to send info
        headers: {
          "Content-Type": "application/json",
          "x-apikey": APIKEY,
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(jsondata),
        beforeSend: function () {
          //@TODO use loading bar instead
          // Disable our button or show loading bar
          document.getElementById("userinfo-submit").disabled = true;
          // Clear our form using the form ID and triggering its reset feature
          document.getElementById("add-userinfo-form").reset();
        }
      }
  
      //[STEP 5]: Send our AJAX request over to the DB and print response of the RESTDB storage to console.
      fetch("https://salvagedsavings-713c.restdb.io/rest/userinfo", settings)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          document.getElementById("userinfo-submit").disabled = true;
          //@TODO update frontend UI 
          document.getElementById("add-update-msg").style.display = "block";
          setTimeout(function () {
            document.getElementById("add-update-msg").style.display = "none";
          }, 3000);
          // Update our table 
          getContacts();
        });
    });//end click 
  
  
    //[STEP] 6
    // Let's create a function to allow you to retrieve all the information in your contacts
    // By default, we only retrieve 10 results
    function getContacts(limit = 10, all = true) {
  
      //[STEP 7]: Create our AJAX settings
      let settings = {
        method: "GET", //[cher] we will use GET to retrieve info
        headers: {
          "Content-Type": "application/json",
          "x-apikey": APIKEY,
          "Cache-Control": "no-cache"
        },
      }
  
      //[STEP 8]: Make our AJAX calls
      // Once we get the response, we modify our table content by creating the content internally. We run a loop to continuously add on data
      // RESTDb/NoSql always adds in a unique id for each data; we tap on it to have our data and place it into our links 
      fetch("https://salvagedsavings-713c.restdb.io/rest/userinfo", settings)
        .then(response => response.json())
        .then(response => {
          let content = "";
  
          for (var i = 0; i < response.length && i < limit; i++) {
            //console.log(response[i]);
            //[METHOD 1]
            // Let's run our loop and slowly append content
            // We can use the normal string append += method
            /*
            content += "<tr><td>" + response[i].name + "</td>" +
              "<td>" + response[i].email + "</td>" +
              "<td>" + response[i].message + "</td>
              "<td>Del</td><td>Update</td</tr>";
            */
  
            //[METHOD 2]
            // Using our template literal method using backticks
            // Take note that we can't use += for template literal strings
            // We use ${content} because -> content += content 
            // We want to add on previous content at the same time
            content = `${content}<tr id='${response[i]._id}'>
            <td>${response[i].username}</td>
            <td>${response[i].email}</td>
            <td>${response[i].password}</td>
            <td><a href='#' class='delete' data-id='${response[i]._id}'>Del</a></td><td><a href='#update-userinfo-container' class='update' data-id='${response[i]._id}' data-username='${response[i].username}' data-email='${response[i].email}' data-password='${response[i].password}'>Update</a></td></tr>`;
  
          }
  
          //[STEP 9]: Update our HTML content
          // Let's dump the content into our table body
          document.getElementById("userinfo-list").getElementsByTagName("tbody")[0].innerHTML = content;
  
          document.getElementById("total-userinfo").innerHTML = response.length;
        });
    }
  
    //[STEP 10]: Create our update listener
    // Here we tap onto our previous table when we click on update
    // This is a delegation feature of jQuery
    // Because our content is dynamic in nature, we listen in on the main container which is "#contact-list". For each row, we have a class .update to help us
    document.getElementById("userinfo-list").addEventListener("click", function (e) {
      if (e.target.classList.contains("update")) {
        e.preventDefault();
        // Update our update form values
        let infoUsername = e.target.getAttribute("data-username");
        let infoEmail = e.target.getAttribute("data-email");
        let infoPassword = e.target.getAttribute("data-password");
        let contactId = e.target.getAttribute("data-id");
  
        //[STEP 11]: Load in our data from the selected row and add it to our update contact form 
        document.getElementById("update-userinfo-username").value = infoUsername;
        document.getElementById("update-userinfo-email").value = infoEmail;
        document.getElementById("update-userinfo-password").value = infoPassword;
        document.getElementById("update-userinfo-id").value = contactId;
        document.getElementById("update-userinfo-container").style.display = "block";
      }
    });//end contact-list listener for update function
  
    //[STEP 12]: Here we load in our contact form data
    // Update form listener
    document.getElementById("update-userinfo-submit").addEventListener("click", function (e) {
      e.preventDefault();
      // Retrieve all my update form values
      let infoUsername = document.getElementById("update-userinfo-username").value;
      let infoEmail = document.getElementById("update-userinfo-email").value;
      let infoPassword = document.getElementById("update-userinfo-password").value;
      let contactId = document.getElementById("update-userinfo-id").value;
  
      console.log(document.getElementById("update-userinfo-msg").value);
      console.log(contactMsg);
  
      //[STEP 12a]: We call our update form function which makes an AJAX call to our RESTDB to update the selected information
      updateForm(contactId, infoUsername, infoEmail, infoPassword, contactMsg);
    });//end updatecontactform listener
  
    //[STEP 13]: Function that makes an AJAX call and processes it 
    // UPDATE Based on the ID chosen
    function updateForm(id, infoUsername, infoEmail, infoPassword, contactMsg) {
      //@TODO create validation methods for id etc. 
  
      var jsondata = { "username": infoUsername, "email": infoEmail, "password": infoPassword };
      var settings = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-apikey": APIKEY,
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(jsondata)
      }
  
      //[STEP 13a]: Send our AJAX request and hide the update contact form
      fetch(`https://salvagedsavings-713c.restdb.io/rest/userinfo/${id}`, settings)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          document.getElementById("update-userinfo-container").style.display = "none";
          // Update our contacts table
          getContacts();
        });
    }//end updateform function
  
  });
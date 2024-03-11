function submitQuery() {
    var responseElement = document.getElementById("response");
    var firstChild = responseElement.firstChild;

    var query = document.getElementById("query").value;
    document.getElementById("query").value = "";
    
    var userQueryDiv = document.createElement("div"); // Create a new div element
    userQueryDiv.className = "user-query"; // Set the class of the new div element
    userQueryDiv.innerHTML = "<b class='author-name'>User: </b><div class='response-body'>" + query + "</div>"; // Set the inner HTML of the new div element

    responseElement.appendChild(userQueryDiv);
    responseElement.scrollTop = responseElement.scrollHeight;

    fetch("/interact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({query: query})
    })
    .then(response => response.json())
    .then(data => {
        var modelResponseDiv = document.createElement("div"); // Create a new div element
        modelResponseDiv.className = "model-response"; // Set the class of the new div element
        modelResponseDiv.innerHTML = "<b class='author-name'>AI Expert: </b><div class='response-body'>" + data.answer + "</div>"; // Set the inner HTML of the new div element    

        responseElement.appendChild(modelResponseDiv);    
        responseElement.scrollTop = responseElement.scrollHeight;
    })
    .catch(error => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", function() {
  // Get the text input element
  var inputElement = document.getElementById("query");

  inputElement.addEventListener("keydown", function(event) {
      // Check if the pressed key is Enter and the input field is not empty
      if (event.key === "Enter" && inputElement.value.trim() !== "") {
          // Call the function to submit the query
          submitQuery();
      }
  });
});
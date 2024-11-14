// This function will be called when the user uploads the ZIP file
async function processZip() {
    const fileInput = document.getElementById("zipInput");
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ''; // Clear previous results

    if (fileInput.files.length === 0) {
        alert("Please upload a ZIP file.");
        return;
    }
    const file = fileInput.files[0];
    const zip = await JSZip.loadAsync(file);

    try {
        // Adjust paths as per your ZIP file structure
        const followersData = await zip.file("connections/followers_and_following/followers_1.json").async("string");
        const followingData = await zip.file("connections/followers_and_following/following.json").async("string");

        // Parse JSON content
        const followers = JSON.parse(followersData);
        const followingDataParsed = JSON.parse(followingData);

        // Debugging: Inspect the following data structure
        console.log("Following data structure:", followingDataParsed);

        // Check if following is an array or wrapped inside an object
        const following = Array.isArray(followingDataParsed)
            ? followingDataParsed
            : followingDataParsed["relationships_following"]; // Adjust based on actual key

        // Check if following is correctly loaded as an array
        if (!Array.isArray(following)) {
            throw new Error("Following data is not in the expected array format.");
        }

        // Extract follower values for comparison
        const followerValues = new Set(followers.map(obj => obj.string_list_data[0].value));

        // Display users not following back
        following.forEach(obj => {
            const value = obj.string_list_data[0].value;
            if (!followerValues.has(value)) {
                // Create a link for the user
                const listItem = document.createElement("p");

                // Create an anchor tag for the Instagram link
                const userLink = document.createElement("a");
                userLink.href = `https://www.instagram.com/${value}`;
                userLink.target = "_blank"; // Open in a new tab
                userLink.textContent = value; // Display the Instagram handle

                // Append the link to the list item and then append to results
                listItem.appendChild(userLink);
                listItem.appendChild(document.createTextNode(" is not following you back."));
                resultsDiv.appendChild(listItem);
            }
        });
    } catch (error) {
        resultsDiv.textContent = "Error processing the ZIP file: " + error;
    }
}

// Attach event listener to file input to trigger the processZip function
document.getElementById("zipInput").addEventListener("change", processZip);

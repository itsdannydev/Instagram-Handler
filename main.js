// This function will be called when the user uploads the ZIP file
async function processZip() {
    const fileInput = document.getElementById("zipInput");
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ''; // Clear previous results

    if (fileInput.files.length === 0) {
        alert("Please upload a ZIP file.");
        return;
    }

    try {
        const file = fileInput.files[0];
        const zip = await JSZip.loadAsync(file);
        
        // Define paths for JSON files within the ZIP
        const followersData = await zip.file("connections/followers_and_following/followers_1.json").async("string");
        const followingData = await zip.file("connections/followers_and_following/following.json").async("string");

        // Parse JSON content
        const followers = JSON.parse(followersData);
        const followingDataParsed = JSON.parse(followingData);

        // Determine following array structure
        const following = Array.isArray(followingDataParsed)
            ? followingDataParsed
            : followingDataParsed["relationships_following"];

        if (!Array.isArray(following)) {
            throw new Error("Following data is not in the expected array format.");
        }

        // Extract follower values for comparison
        const followerValues = new Set(followers.map(obj => obj.string_list_data[0].value));

        // Display users not following back
        following.forEach(obj => {
            const value = obj.string_list_data[0].value;
            if (!followerValues.has(value)) {
                const listItem = document.createElement("p");
                listItem.textContent = `${value} is not following you back.`;
                resultsDiv.appendChild(listItem);
            }
        });
    } catch (error) {
        resultsDiv.textContent = "Error processing the ZIP file: " + error;
    }
}

// Attach event listener to file input to trigger the processZip function
document.getElementById("zipInput").addEventListener("change", processZip);

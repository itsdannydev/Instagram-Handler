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

    try {
        // Load the ZIP file with JSZip
        const zip = await JSZip.loadAsync(file);

        // Check if the required files exist in the ZIP
        const followersFile = zip.file("connections/followers_and_following/followers_1.json");
        const followingFile = zip.file("connections/followers_and_following/following.json");

        // Error handling if files are not found
        if (!followersFile || !followingFile) {
            throw new Error("Required JSON files not found in ZIP.");
        }

        // Read and parse the JSON files
        const followersData = await followersFile.async("string");
        const followingData = await followingFile.async("string");

        const followers = JSON.parse(followersData);
        const followingDataParsed = JSON.parse(followingData);

        // Debugging: Inspect the structure of the following data
        console.log("Following data structure:", followingDataParsed);

        // Ensure the following data is an array
        const following = Array.isArray(followingDataParsed)
            ? followingDataParsed
            : followingDataParsed["relationships_following"];

        // Check if following data is correctly loaded as an array
        if (!Array.isArray(following)) {
            throw new Error("Following data is not in the expected array format.");
        }

        // Extract follower usernames into a Set for efficient lookup
        const followerValues = new Set(followers.map(obj => obj.string_list_data[0].value));

        // Display users who are not following back
        following.forEach(obj => {
            const value = obj.string_list_data[0].value;
            if (!followerValues.has(value)) {
                const listItem = document.createElement("p");
                listItem.textContent = `${value} is not following you back.`;
                resultsDiv.appendChild(listItem);
            }
        });
    } catch (error) {
        console.error("Error processing the ZIP file:", error);
        resultsDiv.textContent = "Error processing the ZIP file: " + error.message;
    }
}

// Attach event listener to file input to trigger the processZip function
document.getElementById("zipInput").addEventListener("change", processZip);

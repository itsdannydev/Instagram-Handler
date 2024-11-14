// This function will be called when the user uploads the ZIP file
async function processZip() {
    const fileInput = document.getElementById("zipInput");
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ''; // Clear previous results
    
    // Step-by-step feedback for mobile users
    function updateStatus(message) {
        const statusMsg = document.createElement("p");
        statusMsg.textContent = message;
        resultsDiv.appendChild(statusMsg);
    }

    if (fileInput.files.length === 0) {
        alert("Please upload a ZIP file.");
        return;
    }

    const file = fileInput.files[0];

    // Verify the uploaded file is indeed a ZIP file
    if (file.type !== "application/zip") {
        alert("Please upload a valid ZIP file.");
        return;
    }
    
    updateStatus("Loading ZIP file...");

    try {
        // Load the ZIP file with JSZip
        const zip = await JSZip.loadAsync(file);
        updateStatus("ZIP file loaded successfully.");

        // Check if the required files exist in the ZIP
        const followersFile = zip.file("connections/followers_and_following/followers_1.json");
        const followingFile = zip.file("connections/followers_and_following/following.json");

        if (!followersFile || !followingFile) {
            throw new Error("Required JSON files not found in ZIP.");
        }
        updateStatus("JSON files found. Processing data...");

        // Read and parse the JSON files
        const followersData = await followersFile.async("string");
        const followingData = await followingFile.async("string");
        updateStatus("JSON data loaded successfully.");

        const followers = JSON.parse(followersData);
        const followingDataParsed = JSON.parse(followingData);

        // Check if following is an array or wrapped inside an object
        const following = Array.isArray(followingDataParsed)
            ? followingDataParsed
            : followingDataParsed["relationships_following"];

        if (!Array.isArray(following)) {
            throw new Error("Following data is not in the expected array format.");
        }
        updateStatus("Data parsed successfully.");

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
        updateStatus("Process completed. Check the list above for results.");

    } catch (error) {
        console.error("Error processing the ZIP file:", error);
        resultsDiv.textContent = "Error processing the ZIP file: " + error.message;
    }
}

// Attach event listener to file input to trigger the processZip function
document.getElementById("zipInput").addEventListener("change", processZip);

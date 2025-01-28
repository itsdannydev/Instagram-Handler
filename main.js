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

        // Check if following is an array or wrapped inside an object
        const following = Array.isArray(followingDataParsed)
            ? followingDataParsed
            : followingDataParsed["relationships_following"]; // Adjust based on actual key

        // Extract follower values for comparison
        const followerValues = new Set(followers.map(obj => obj.string_list_data[0].value));

        // Display users not following back
        following.forEach(obj => {
            const value = obj.string_list_data[0].value;
            const username = value;

            if (!followerValues.has(value)) {
                // Use a placeholder image for now
                const profilePicUrl = `https://www.instagram.com/${username}/profile_picture/`; // Placeholder image
                
                const listItem = document.createElement("div");
                listItem.classList.add("user-item");

                const profilePic = document.createElement("img");
                profilePic.src = profilePicUrl;  // Set the profile picture URL
                profilePic.alt = `${username}'s profile picture`;
                profilePic.classList.add("profile-pic");

                // Create the user name part as a hyperlink
                const userName = document.createElement("a");
                userName.href = `https://www.instagram.com/${username}/`;
                userName.textContent = username; // Only the username is clickable

                // Create the rest of the text
                const followBackText = document.createElement("span");
                followBackText.textContent = ' is not following you back.';

                // Append the profile pic and name to the list item
                listItem.appendChild(profilePic);
                listItem.appendChild(userName);
                listItem.appendChild(followBackText);

                resultsDiv.appendChild(listItem);
            }
        });
    } catch (error) {
        resultsDiv.textContent = "Error processing the ZIP file: " + error;
    }
}

// Attach event listener to file input to trigger the processZip function
document.getElementById("zipInput").addEventListener("change", processZip);

document.getElementById("themeSwitcher").addEventListener("change", function () {
    document.body.classList.toggle("light-mode");
    document.body.classList.toggle("dark-mode");
});

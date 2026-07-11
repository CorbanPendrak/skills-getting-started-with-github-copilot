document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", { cache: "no-store" });
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantList = document.createElement("ul");
        participantList.className = "activity-card__participant-list";

        details.participants.forEach((participant) => {
          const participantItem = document.createElement("li");
          participantItem.className = "activity-card__participant";

          const participantName = document.createElement("span");
          participantName.textContent = participant.split("@")[0];
          participantName.title = participant;

          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "activity-card__remove-button";
          removeButton.setAttribute("aria-label", `Remove ${participant} from ${name}`);
          removeButton.dataset.activity = name;
          removeButton.dataset.participant = participant;
          removeButton.textContent = "❌";

          participantItem.appendChild(participantName);
          participantItem.appendChild(removeButton);
          participantList.appendChild(participantItem);
        });

        activityCard.innerHTML = `
          <div class="activity-card__header">
            <h4>${name}</h4>
            <span class="activity-card__badge">${spotsLeft} spots left</span>
          </div>
          <p class="activity-card__description">${details.description}</p>
          <div class="activity-card__meta">
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants} filled</p>
          </div>
          <div class="activity-card__participants">
            <h5>Participants</h5>
          </div>
        `;

        const participantsSection = activityCard.querySelector(".activity-card__participants");

        if (details.participants.length > 0) {
          participantsSection.appendChild(participantList);
        } else {
          const emptyState = document.createElement("p");
          emptyState.className = "activity-card__empty-state";
          emptyState.textContent = "No participants yet";
          participantsSection.appendChild(emptyState);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".activity-card__remove-button");

    if (!removeButton) {
      return;
    }

    const activity = removeButton.dataset.activity;
    const participant = removeButton.dataset.participant;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(participant)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to remove participant. Please try again.", "error");
      console.error("Error removing participant:", error);
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

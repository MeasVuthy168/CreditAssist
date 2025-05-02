// ✅ Shared Notification Checker
async function checkNotification() {
  try {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser") || "{}");
    const username = user.username || "";

    const res = await fetch("https://secure-backend-tzj9.onrender.com/api/notifications/status");
    const data = await res.json();

    const uploads = ['user', 'customer', 'turnover', 'nbcos'];
    const lastReadRaw = data[`read_${username}`];
    const lastRead = lastReadRaw ? new Date(lastReadRaw) : null;

    const notificationMessages = {
      user: "បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ​ភ្នាក់ងារឥណទាន",
      customer: "បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យអតិថិជន",
      turnover: "បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ​ (Debit Turnover)",
      nbcos: "បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យឥណទានសកម្ម​ (NBC Loan Outstanding Grid Merge)"
    };

    let newCount = 0;
    let messages = [];

    uploads.forEach(type => {
      const dateStr = data[type];
      if (!dateStr) return;
      const uploadedAt = new Date(dateStr);
      if (!lastRead || uploadedAt > lastRead) {
        newCount++;
        messages.push(notificationMessages[type] || `បានធ្វើបច្ចុប្បន្នភាពទិន្នន័យ ${type}`);
      }
    });

    const badge = document.getElementById("notif-badge");
    if (badge) {
      if (newCount > 0) {
        badge.textContent = newCount > 9 ? "9+" : newCount;
        badge.style.display = "inline-block";
      } else {
        badge.style.display = "none";
      }
    }

    return messages; // Optional: you can use this for popup display
  } catch (err) {
    console.error("Notification fetch error:", err);
  }
}

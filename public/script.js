document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('streamerName').value.trim();
  document.getElementById('errorMsg').classList.add('hidden');
  document.getElementById('statsContainer').classList.add('hidden');
  document.getElementById('statsList').innerHTML = '';
  document.getElementById('streamerTitle').innerText = '';

  if (!name) return;

  try {
    const res = await fetch(`/api/stats/${name}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    document.getElementById('streamerTitle').innerText = `${data.username} is LIVE!`;
    const statsList = document.getElementById('statsList');
    const stats = {
      "Live Viewers": data.liveViewers,
      "Followers": data.followers,
      "Subs": data.subs,
      "Chats per Minute": data.chatsPerMinute,
      "Engagement Rate": data.engagementRate,
      "Unique Viewers": data.uniqueViewers
    };
    for (let key in stats) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${key}:</strong> ${stats[key]}`;
      statsList.appendChild(li);
    }
    document.getElementById('statsContainer').classList.remove('hidden');
  } catch (err) {
    document.getElementById('errorMsg').innerText = err.message;
    document.getElementById('errorMsg').classList.remove('hidden');
  }
});

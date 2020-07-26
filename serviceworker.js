addEventListener("fetch", (fetchEvent) => {
  console.log("서비스 워커가 fetch 이벤트를 감시합니다.", fetchEvent);

  fetchEvent.respondWith(new Response("변조된 Response"));
});

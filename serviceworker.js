addEventListener("fetch", (fetchEvent) => {
  console.log("서비스 워커가 fetch 이벤트를 감시합니다.", fetchEvent);

  const request = fetchEvent.request;

  fetchEvent.respondWith(
    fetch(request)
      .then((responseFormFetch) => {
        return responseFormFetch;
      })
      .catch((error) => {
        return new Response("<h1> Error </h1> <p> 뭔가 잘못되었습니다! </p>", {
          headers: {
            "Content-type": "text/html;charset=utf-8",
          },
        });
      })
  );
});

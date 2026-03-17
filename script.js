const cards = document.querySelectorAll(".memory-card");
const body = document.body;

const memoryOverlay = document.querySelector(".memory-overlay");
const journalOverlay = document.querySelector(".journal-overlay");
const animeOverlay = document.querySelector(".anime-overlay");

const memoryPreview = document.getElementById("memoryPreview");
const memoryVideo = document.getElementById("memoryVideo");
const memoryVideoSource = document.getElementById("memoryVideoSource");
const memoryTitle = document.getElementById("memoryTitle");
const memoryDescription = document.getElementById("memoryDescription");

const journalSpreads = Array.from(document.querySelectorAll(".journal-spread"));
const journalStatus = document.getElementById("journalStatus");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

const animeSlides = Array.from(document.querySelectorAll(".anime-photo-slide"));
const animeNextBtn = document.getElementById("animeNextBtn");
const animeStatus = document.getElementById("animeStatus");

let activeCard = null;
let currentSpread = 0;
let currentAnimeSlide = 0;

function openOverlay(overlay) {
  if (!overlay) return;
  overlay.classList.add("is-visible");
  overlay.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeOverlay(overlay) {
  if (!overlay) return;

  overlay.classList.remove("is-visible");
  overlay.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");

  if (memoryVideo) {
    memoryVideo.pause();
    memoryVideo.currentTime = 0;
  }

  if (activeCard) {
    activeCard.classList.remove("is-launching");
    activeCard = null;
  }

  if (overlay === journalOverlay) {
    updateJournalSpread(0, "prev");
  }

  if (overlay === animeOverlay) {
    updateAnimeSlide(0);
  }
}

function launchCard(card, callback) {
  if (activeCard) {
    activeCard.classList.remove("is-launching");
  }

  activeCard = card;
  card.classList.add("is-launching");

  setTimeout(callback, 480);
}

function updateJournalSpread(index, direction = "next") {
  if (!journalSpreads.length) return;

  currentSpread = Math.max(0, Math.min(index, journalSpreads.length - 1));

  journalSpreads.forEach((spread, i) => {
    spread.classList.remove("is-active", "turn-next", "turn-prev");

    if (i === currentSpread) {
      spread.classList.add("is-active");
      spread.classList.add(direction === "prev" ? "turn-prev" : "turn-next");
    }
  });

  if (journalStatus) {
    const activeDate = journalSpreads[currentSpread].querySelector(".page-date");
    journalStatus.textContent = activeDate ? activeDate.textContent : `Page ${currentSpread + 1}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = currentSpread === 0;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = currentSpread === journalSpreads.length - 1;
  }
}

function updateAnimeSlide(index) {
  if (!animeSlides.length) return;

  if (index >= animeSlides.length) {
    animeSlides.forEach((slide, i) => {
      slide.classList.remove("is-hidden", "is-active");
      if (i === 0) {
        slide.classList.add("is-active");
      }
    });
    currentAnimeSlide = 0;
  } else if (index < 0) {
    currentAnimeSlide = 0;
  } else {
    currentAnimeSlide = index;

    animeSlides.forEach((slide, i) => {
      slide.classList.remove("is-active");

      if (i < currentAnimeSlide) {
        slide.classList.add("is-hidden");
      } else {
        slide.classList.remove("is-hidden");
      }

      if (i === currentAnimeSlide) {
        slide.classList.add("is-active");
      }
    });
  }

  if (animeStatus) {
    animeStatus.textContent = `Photo ${currentAnimeSlide + 1} / ${animeSlides.length}`;
  }
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const type = card.dataset.type;

    launchCard(card, () => {
      if (type === "journal") {
        updateJournalSpread(currentSpread, "next");
        openOverlay(journalOverlay);
        return;
      }

      if (type === "anime") {
        updateAnimeSlide(0);
        openOverlay(animeOverlay);
        return;
      }

      const mediaType = card.dataset.media || "image";

      if (memoryTitle) {
        memoryTitle.textContent = card.dataset.title || "";
      }

      if (memoryDescription) {
        memoryDescription.textContent = card.dataset.description || "";
      }

      if (mediaType === "video") {
        if (memoryPreview) {
          memoryPreview.style.display = "none";
        }

        if (memoryVideo && memoryVideoSource) {
          memoryVideo.style.display = "block";
          memoryVideoSource.src = card.dataset.video || "";
          memoryVideo.load();
        }
      } else {
        if (memoryVideo && memoryVideoSource) {
          memoryVideo.pause();
          memoryVideo.style.display = "none";
          memoryVideoSource.src = "";
        }

        if (memoryPreview) {
          memoryPreview.style.display = "block";
          memoryPreview.src = card.dataset.image || "";
          memoryPreview.alt = card.dataset.title || "";
        }
      }

      openOverlay(memoryOverlay);
    });
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    let target = memoryOverlay;

    if (button.dataset.close === "journal") {
      target = journalOverlay;
    }

    if (button.dataset.close === "anime") {
      target = animeOverlay;
    }

    closeOverlay(target);
  });
});

[memoryOverlay, journalOverlay, animeOverlay].forEach((overlay) => {
  if (!overlay) return;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeOverlay(overlay);
    }
  });
});

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    updateJournalSpread(currentSpread - 1, "prev");
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    updateJournalSpread(currentSpread + 1, "next");
  });
}

if (animeNextBtn) {
  animeNextBtn.addEventListener("click", () => {
    updateAnimeSlide(currentAnimeSlide + 1);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (animeOverlay && animeOverlay.classList.contains("is-visible")) {
      closeOverlay(animeOverlay);
      return;
    }

    if (journalOverlay && journalOverlay.classList.contains("is-visible")) {
      closeOverlay(journalOverlay);
      return;
    }

    if (memoryOverlay && memoryOverlay.classList.contains("is-visible")) {
      closeOverlay(memoryOverlay);
    }

    return;
  }

  if (journalOverlay && journalOverlay.classList.contains("is-visible")) {
    if (event.key === "ArrowRight") {
      updateJournalSpread(currentSpread + 1, "next");
    }

    if (event.key === "ArrowLeft") {
      updateJournalSpread(currentSpread - 1, "prev");
    }
  }

  if (animeOverlay && animeOverlay.classList.contains("is-visible")) {
    if (event.key === "ArrowRight") {
      updateAnimeSlide(currentAnimeSlide + 1);
    }
  }
});

updateJournalSpread(0, "prev");
updateAnimeSlide(0);

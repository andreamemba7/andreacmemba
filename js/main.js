// Builds one slide per project, using only its first media item. The rest
// of a project's media (up to 7 more) are swap-in thumbnails on that
// project's own page only - they're not separate slides here, so adding
// them doesn't inflate the home slider or the Index grid.
function buildSlides(projects) {
  const slides = [];
  projects.forEach((project, projectIndex) => {
    // project.cover is resolved in sanity-client.js from the editor's
    // coverIndex; demo data in js/data.js has no cover, so fall back to
    // the first media item there.
    const media = project.cover || (project.media || [])[0];
    if (media) slides.push({ project, projectIndex, media });
  });
  return slides;
}

// Builds the actual media element for a slide: <img> for images, <video>
// for uploaded video files, <iframe> for external YouTube/Vimeo links.
// Playback is controlled by the caller (IntersectionObserver below), so
// video starts paused rather than autoplaying immediately on creation.
function buildMediaElement(media, altText) {
  if (media.type === "video") {
    const video = document.createElement("video");
    video.src = media.src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    if (media.poster) video.poster = media.poster;
    video.setAttribute("aria-label", altText);
    return video;
  }

  if (media.type === "embed") {
    const iframe = document.createElement("iframe");
    const separator = media.src.includes("?") ? "&" : "?";
    iframe.src = media.src + separator + "autoplay=0&muted=1&loop=1&playsinline=1";
    iframe.title = altText;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
    iframe.allowFullscreen = true;
    return iframe;
  }

  const img = document.createElement("img");
  img.src = media.src;
  img.alt = altText;
  return img;
}

// Embeds (YouTube/Vimeo iframes) don't expose a shared play()/pause() API
// the way <video> does, so play/pause on scroll only applies to <video>.
function playMedia(el) {
  if (el.tagName === "VIDEO") el.play().catch(() => {});
}

function pauseMedia(el) {
  if (el.tagName === "VIDEO") el.pause();
}

// Thumbnail for the Index page grid. Images use their own URL; uploaded
// video files have no separate poster from Sanity, so a muted <video>
// seeked to a fraction of a second in shows a frame instead; embeds fall
// back to a poster (YouTube) or the grid's plain background (Vimeo).
function buildThumbnailElement(media, altText) {
  if (media.type === "image") {
    const img = document.createElement("img");
    img.src = media.src;
    img.alt = altText;
    img.loading = "lazy";
    return img;
  }

  if (media.type === "video") {
    const video = document.createElement("video");
    video.src = media.src + "#t=0.1";
    video.muted = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", altText);
    return video;
  }

  if (media.poster) {
    const img = document.createElement("img");
    img.src = media.poster;
    img.alt = altText;
    img.loading = "lazy";
    return img;
  }

  const placeholder = document.createElement("div");
  placeholder.className = "archive-thumb-placeholder";
  placeholder.setAttribute("aria-label", altText);
  return placeholder;
}

// Home page - full-screen vertical scroll-snap slider. Scrolling (wheel,
// touch drag, or keyboard) snaps to the next/previous slide; the header
// counter/title update to match whichever slide is in view, and only the
// visible slide's video plays.
(async function () {
  const track = document.getElementById("slides");
  if (!track || typeof window.loadProjects !== "function") return;

  const projects = await window.loadProjects();
  const slides = buildSlides(projects);
  if (!slides.length) return;

  const counterEl = document.getElementById("counter");
  const titleEl = document.getElementById("projectTitle");

  const sections = slides.map((slide, index) => {
    const section = document.createElement("section");
    section.className = "slide";
    section.dataset.index = String(index);

    const mediaWrap = document.createElement("div");
    mediaWrap.className = "slide-media slide-media-clickable";
    mediaWrap.appendChild(buildMediaElement(slide.media, slide.project.name));
    mediaWrap.addEventListener("click", () => {
      window.location.href = "project.html?slug=" + encodeURIComponent(slide.project.slug);
    });

    section.appendChild(mediaWrap);
    track.appendChild(section);
    return section;
  });

  let activeIndex = 0;

  function updateMeta(index) {
    counterEl.textContent = (index + 1) + " | " + slides.length;
    titleEl.textContent = slides[index].project.name;
    history.replaceState(null, "", "#" + index);
  }

  function setActive(index) {
    if (index === activeIndex && sections[index].dataset.activated) return;
    activeIndex = index;
    sections.forEach((section, i) => {
      const el = section.querySelector("video, iframe");
      if (!el) return;
      if (i === index) {
        section.dataset.activated = "true";
        playMedia(el);
      } else {
        pauseMedia(el);
      }
    });
    updateMeta(index);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        setActive(Number(entry.target.dataset.index));
      }
    });
  }, { root: track, threshold: [0.6] });

  sections.forEach((section) => observer.observe(section));

  let startIndex = 0;
  const hashIndex = parseInt(window.location.hash.replace("#", ""), 10);
  if (!isNaN(hashIndex) && hashIndex >= 0 && hashIndex < slides.length) {
    startIndex = hashIndex;
  }
  sections[startIndex].scrollIntoView({ block: "start" });
  setActive(startIndex);

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      sections[Math.min(sections.length - 1, activeIndex + 1)].scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (e.key === "ArrowUp") {
      sections[Math.max(0, activeIndex - 1)].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();

// Index page - a grid of every slide's thumbnail, linking straight into
// that project's own page.
(async function () {
  const grid = document.getElementById("archiveGrid");
  if (!grid || typeof window.loadProjects !== "function") return;

  const projects = await window.loadProjects();
  const slides = buildSlides(projects);

  slides.forEach((slide) => {
    const li = document.createElement("li");
    li.className = "archive-cell";

    const a = document.createElement("a");
    a.className = "archive-thumb";
    a.href = "project.html?slug=" + encodeURIComponent(slide.project.slug);
    a.title = slide.project.name;

    a.appendChild(buildThumbnailElement(slide.media, slide.project.name));
    li.appendChild(a);
    grid.appendChild(li);
  });
})();

// Project page - the case-study page a home-slider click lands on.
// Shows one media item large ("hero", click-to-play if it's a video) plus
// the rest of the project's media as a thumbnail row that swaps the hero;
// below that, the description, Andrea's role, and everyone else's credits.
(async function () {
  const heading = document.getElementById("projectHeading");
  const heroWrap = document.getElementById("projectHero");
  if (!heading || !heroWrap || typeof window.loadProjects !== "function") return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const projects = await window.loadProjects();
  const project = projects.find((p) => p.slug === slug) || projects[0];
  if (!project) return;

  document.title = project.name + " - Andrea";
  heading.textContent = project.name;

  const media = project.media || [];

  const thumbsWrap = document.getElementById("projectThumbs");

  // The row shows EVERY media item, always in the same order, with the
  // current one marked. Filtering out the active item made the row reflow
  // on every click and stranded whichever video you started on.
  function renderThumbs(currentItem) {
    if (!thumbsWrap) return;
    thumbsWrap.innerHTML = "";
    media.slice(0, 8).forEach((item) => {
      const button = document.createElement("button");
      button.className = "project-thumb";
      if (item === currentItem) button.classList.add("is-active");
      button.setAttribute("aria-label", "Show this media");
      button.setAttribute("aria-current", item === currentItem ? "true" : "false");
      const thumbEl = buildThumbnailElement(item, project.name);
      button.appendChild(thumbEl);
      trackIntrinsicRatio(button, thumbEl, "--thumb-ratio");
      if (item.type === "video" || item.type === "embed") {
        const icon = document.createElement("span");
        icon.className = "project-thumb-play";
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="white"/></svg>';
        button.appendChild(icon);
      }
      button.addEventListener("click", () => renderHero(item));
      thumbsWrap.appendChild(button);
    });
  }

  function renderHero(item) {
    heroWrap.innerHTML = "";
    heroWrap.appendChild(buildHeroMediaElement(item, project.name));
    renderThumbs(item);
  }

  renderHero(project.cover || media[0]);

  const descriptionEl = document.getElementById("projectDescription");
  if (descriptionEl) {
    if (project.description) {
      descriptionEl.textContent = project.description;
    } else {
      descriptionEl.remove();
    }
  }

  const roleEl = document.getElementById("projectRole");
  if (roleEl) {
    if (project.role) {
      roleEl.textContent = project.role;
    } else {
      roleEl.remove();
    }
  }

  const creditsEl = document.getElementById("projectCredits");
  if (creditsEl) {
    const credits = project.credits || [];
    if (credits.length) {
      creditsEl.textContent = credits.map((c) => `${c.role}: ${c.name}`).join(", ");
    } else {
      creditsEl.remove();
    }
  }

  const castEl = document.getElementById("projectCast");
  if (castEl) {
    if (project.cast) {
      castEl.textContent = "Starring: " + project.cast;
    } else {
      castEl.remove();
    }
  }

  const outtakesWrap = document.getElementById("projectOuttakesWrap");
  const outtakesTrack = document.getElementById("projectOuttakes");
  if (outtakesWrap && outtakesTrack) {
    const outtakes = project.outtakes || [];
    if (outtakes.length) {
      outtakes.forEach((item) => {
        const cell = document.createElement("div");
        cell.className = "project-outtake";
        if (item.orientation === "landscape" || item.orientation === "square") {
          cell.classList.add("project-outtake--" + item.orientation);
        }
        const media = buildThumbnailElement(item, project.name);
        cell.appendChild(media);
        // Video outtakes preview muted on hover, same as the Index grid.
        if (media.tagName === "VIDEO") {
          cell.addEventListener("mouseenter", () => media.play().catch(() => {}));
          cell.addEventListener("mouseleave", () => {
            media.pause();
            media.currentTime = 0.1;
          });
        }
        outtakesTrack.appendChild(cell);
      });
      outtakesWrap.hidden = false;
    } else {
      outtakesWrap.remove();
    }
  }

  // Index - every other project, so someone can jump straight from this
  // case study into any of the others. "Index" here is a plain label
  // (unlike the footer's own Index link), not a link itself.
  const relatedWrap = document.getElementById("projectRelatedWrap");
  const relatedGrid = document.getElementById("projectRelatedGrid");
  if (relatedWrap && relatedGrid) {
    const others = projects.filter((p) => p.slug !== project.slug);
    if (others.length) {
      others.forEach((other) => {
        const a = document.createElement("a");
        a.href = "project.html?slug=" + encodeURIComponent(other.slug);
        a.title = other.name;
        const firstMedia = other.cover || (other.media || [])[0];
        if (firstMedia) {
          const thumb = buildThumbnailElement(firstMedia, other.name);
          a.appendChild(thumb);
          // Video thumbnails preview muted on hover instead of sitting
          // fully static like the image ones.
          if (thumb.tagName === "VIDEO") {
            a.addEventListener("mouseenter", () => thumb.play().catch(() => {}));
            a.addEventListener("mouseleave", () => {
              thumb.pause();
              thumb.currentTime = 0.1;
            });
          }
        }
        relatedGrid.appendChild(a);
      });
      relatedWrap.hidden = false;
    } else {
      relatedWrap.remove();
    }
  }
})();

// Hero media for the project page. Images/embeds render plainly; an
// uploaded video file starts paused behind a big click-to-play button,
// then hands off to native controls once playing.
// Writes a media element's real dimensions onto its container as a CSS
// custom property, so the box can reshape to match what's actually inside
// it. Both --hero-ratio and --thumb-ratio default to 16/9 in the
// stylesheet, so layout is stable before metadata arrives and only
// corrects itself once the true size is known.
function trackIntrinsicRatio(container, el, varName) {
  function set(w, h) {
    if (w > 0 && h > 0) container.style.setProperty(varName, w + " / " + h);
  }
  if (el.tagName === "VIDEO") {
    if (el.videoWidth) set(el.videoWidth, el.videoHeight);
    el.addEventListener("loadedmetadata", () => set(el.videoWidth, el.videoHeight));
  } else if (el.tagName === "IMG") {
    if (el.naturalWidth) set(el.naturalWidth, el.naturalHeight);
    el.addEventListener("load", () => set(el.naturalWidth, el.naturalHeight));
  }
  // iframes (YouTube/Vimeo) expose no intrinsic size cross-origin, so
  // those keep the 16/9 default.
}

function applyHeroRatio(block, el) {
  trackIntrinsicRatio(block, el, "--hero-ratio");
}

function buildHeroMediaElement(media, altText) {
  if (!media) return document.createElement("div");

  if (media.type !== "video") {
    const block = document.createElement("div");
    block.className = "project-block";
    const el = buildMediaElement(media, altText);
    block.appendChild(el);
    applyHeroRatio(block, el);
    return block;
  }

  const block = document.createElement("div");
  block.className = "project-block project-video-block";

  const video = document.createElement("video");
  video.src = media.src;
  if (media.poster) video.poster = media.poster;
  video.playsInline = true;
  video.preload = "metadata";
  video.setAttribute("aria-label", altText);
  applyHeroRatio(block, video);

  const playButton = document.createElement("button");
  playButton.className = "project-play";
  playButton.setAttribute("aria-label", "Play video");
  playButton.innerHTML = '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M8 5v14l11-7z" fill="white"/></svg>';

  // No native controls - they render as an opaque bar on some browsers
  // that eats into the video. Clicking the video itself (once playing)
  // pauses it and brings the custom play button back instead.
  playButton.addEventListener("click", () => {
    video.play().catch(() => {});
  });

  video.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", () => {
    playButton.style.display = "none";
  });

  video.addEventListener("pause", () => {
    playButton.style.display = "";
  });

  block.appendChild(video);
  block.appendChild(playButton);
  return block;
}

// Info page background - a blurred grid built from the site's own
// photography images (real Sanity photos when configured, demo photos
// otherwise), repeated to fill the grid if there are fewer than 10.
(async function () {
  const bg = document.getElementById("infoBg");
  if (!bg || typeof window.loadPhotos !== "function") return;

  // Two modes, one page. No ?album= param means the photography index:
  // one cover per album, clicking navigates into it. With ?album=<slug>
  // this is the album interior: that album's photos, laid out as a
  // contact sheet, clicking opens the flip viewer.
  const albumSlug = new URLSearchParams(window.location.search).get("album");
  let photos;

  if (albumSlug && typeof window.loadPhotoAlbums === "function") {
    const albums = await window.loadPhotoAlbums();
    const album = albums.find((a) => a.slug === albumSlug);
    if (!album) {
      window.location.replace("photography.html");
      return;
    }
    photos = album.photos;
    document.title = album.title + " - Andrea";
    document.body.classList.add("page-album");

    const masthead = document.getElementById("albumMasthead");
    if (masthead) masthead.hidden = false;
    const titleEl = document.getElementById("albumTitle");
    if (titleEl) titleEl.textContent = album.title;
    const subEl = document.getElementById("albumSubtitle");
    if (subEl) subEl.textContent = album.subtitle;
    const countEl = document.getElementById("albumCount");
    if (countEl) {
      countEl.textContent =
        album.photos.length + (album.photos.length === 1 ? " frame" : " frames");
    }

    // A deliberate rhythm rather than a uniform grid: every 7th frame
    // breaks the columns and runs full width, so scrolling the album has
    // a pulse instead of a drone.
    grid.classList.add("album-sheet");
  } else if (typeof window.loadPhotoAlbums === "function") {
    const albums = await window.loadPhotoAlbums();
    grid.classList.add("album-index");
    albums.forEach((album) => {
      const a = document.createElement("a");
      a.className = "album-card";
      a.href = "photography.html?album=" + encodeURIComponent(album.slug);

      const img = document.createElement("img");
      img.src = album.cover.url;
      img.alt = album.title;
      img.loading = "lazy";
      a.appendChild(img);

      const meta = document.createElement("span");
      meta.className = "album-card-meta";
      meta.innerHTML =
        '<span class="album-card-title"></span><span class="album-card-count"></span>';
      meta.querySelector(".album-card-title").textContent = album.title;
      meta.querySelector(".album-card-count").textContent = album.photos.length;
      a.appendChild(meta);

      grid.appendChild(a);
    });
    return; // index mode has no flip viewer - clicking navigates
  } else {
    photos = await window.loadPhotos();
  }
  if (!photos.length) return;

  const slots = 10;
  for (let i = 0; i < slots; i++) {
    const photo = photos[i % photos.length];
    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = "";
    bg.appendChild(img);
  }
})();

// Info page email - clicking it copies the address instead of opening a
// mail client. A tooltip reads "Click to copy" on hover and flips to
// "Copied!" (staying visible even without a hover) right after clicking.
(function () {
  const btn = document.getElementById("infoEmail");
  const tooltip = document.getElementById("infoEmailTooltip");
  if (!btn || !tooltip) return;

  const email = btn.dataset.email || btn.textContent.trim();
  let resetTimer = null;

  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(email).then(() => {
      clearTimeout(resetTimer);
      tooltip.textContent = "Copied!";
      tooltip.classList.add("is-visible");
      resetTimer = setTimeout(() => {
        tooltip.classList.remove("is-visible");
        tooltip.textContent = "Click to copy";
      }, 1500);
    }).catch(() => {});
  });
})();

// Info page local time - a live clock for Arusha, Tanzania (East Africa
// Time), formatted like "7:07pm".
(function () {
  const el = document.getElementById("infoTime");
  if (!el) return;

  function update() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Dar_es_Salaam",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).formatToParts(new Date());

    let hour = "", minute = "", period = "";
    parts.forEach((p) => {
      if (p.type === "hour") hour = p.value;
      if (p.type === "minute") minute = p.value;
      if (p.type === "dayPeriod") period = p.value.toLowerCase();
    });

    el.textContent = `${hour}:${minute}${period}`;
  }

  update();
  setInterval(update, 30000);
})();

// Photography page - a flat grid of standalone photos. Clicking one plays
// a FLIP transition into an enlarged, centered view of that same photo
// (see the CSS for .photo-flip-viewer) instead of navigating away.
(async function () {
  const grid = document.getElementById("photoGrid");
  const viewer = document.getElementById("photoFlipViewer");
  if (!grid || typeof window.loadPhotos !== "function") return;

  const photos = await window.loadPhotos();

  const flipImage = document.getElementById("flipImage");
  const headingEl = document.getElementById("flipHeading");
  const subheadingEl = document.getElementById("flipSubheading");
  const counterEl = document.getElementById("flipCounter");
  const closeBtn = document.getElementById("flipClose");

  const hasFlipUI = viewer && flipImage && headingEl && subheadingEl && closeBtn;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = 600;
  const EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

  const cells = photos.map((photo, index) => {
    const a = document.createElement("a");
    a.href = "photo-viewer.html#" + index;
    // Every 7th frame breaks the column rhythm and runs full width.
    if (albumSlug && index > 0 && (index + 1) % 7 === 0) a.classList.add("is-wide");

    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = photo.heading || "";
    img.loading = "lazy";

    a.appendChild(img);
    grid.appendChild(a);
    return a;
  });

  if (!hasFlipUI) return;

  let openIndex = -1;
  let isAnimating = false;
  let runningAnimations = [];

  function crossfadeText(el, text) {
    if (reduceMotion) {
      el.textContent = text;
      return;
    }
    el.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 100, easing: "ease-in-out" }).onfinish = () => {
      el.textContent = text;
      el.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 100, easing: "ease-in-out" });
    };
  }

  function updateCaption(index) {
    const photo = photos[index];
    crossfadeText(headingEl, photo.heading || "");
    crossfadeText(subheadingEl, photo.subheading || "");
    if (counterEl) counterEl.textContent = (index + 1) + "/" + photos.length;
  }

  function openPhoto(index) {
    if (isAnimating || openIndex !== -1) return;
    isAnimating = true;
    openIndex = index;

    const cell = cells[index];
    const firstRect = cell.getBoundingClientRect();
    const ratio = firstRect.width / firstRect.height;

    document.documentElement.classList.add("photo-scroll-locked");
    document.body.classList.add("photo-viewer-active");
    // Hidden (not removed) so the grid keeps this cell's slot and every
    // other cell's position never shifts under it.
    cell.style.visibility = "hidden";

    flipImage.src = photos[index].url;
    flipImage.alt = photos[index].heading || "";
    flipImage.style.top = firstRect.top + "px";
    flipImage.style.left = firstRect.left + "px";
    flipImage.style.width = firstRect.width + "px";
    flipImage.style.height = firstRect.height + "px";
    viewer.classList.add("is-active");

    const maxW = Math.min(window.innerWidth * 0.86, 900);
    const maxH = Math.min(window.innerHeight * 0.82, 900);
    let lastW = maxW;
    let lastH = lastW / ratio;
    if (lastH > maxH) {
      lastH = maxH;
      lastW = lastH * ratio;
    }
    const lastTop = (window.innerHeight - lastH) / 2;
    const lastLeft = (window.innerWidth - lastW) / 2;

    if (reduceMotion) {
      flipImage.style.top = lastTop + "px";
      flipImage.style.left = lastLeft + "px";
      flipImage.style.width = lastW + "px";
      flipImage.style.height = lastH + "px";
      viewer.classList.add("is-open");
      updateCaption(index);
      isAnimating = false;
      return;
    }

    const vh = window.innerHeight;
    const animations = [
      flipImage.animate(
        [
          { top: firstRect.top + "px", left: firstRect.left + "px", width: firstRect.width + "px", height: firstRect.height + "px" },
          { top: lastTop + "px", left: lastLeft + "px", width: lastW + "px", height: lastH + "px" }
        ],
        { duration: DURATION, easing: EASING, fill: "forwards" }
      )
    ];

    // Every other cell physically travels off-screen toward whichever
    // edge it already sits closer to - no fades, no crop changes.
    cells.forEach((otherCell, i) => {
      if (i === index) return;
      const rect = otherCell.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = vh + rect.height + 200;
      const ty = center < vh / 2 ? -distance : distance;
      animations.push(
        otherCell.animate(
          [{ transform: "translate(0, 0)" }, { transform: "translate(0, " + ty + "px)" }],
          { duration: DURATION, easing: EASING, fill: "forwards" }
        )
      );
    });

    runningAnimations = animations;
    Promise.allSettled(animations.map((a) => a.finished)).then(() => {
      isAnimating = false;
      viewer.classList.add("is-open");
      updateCaption(index);
    });
  }

  function closePhoto() {
    if (isAnimating || openIndex === -1) return;
    isAnimating = true;
    const index = openIndex;
    const cell = cells[index];

    viewer.classList.remove("is-open");
    // The header/footer don't need to wait for the flip-back animation to
    // finish - restoring them immediately is what makes the nav feel snappy
    // instead of stuck behind the ~600ms close animation.
    document.body.classList.remove("photo-viewer-active");

    function finish() {
      cell.style.visibility = "";
      viewer.classList.remove("is-active");
      flipImage.removeAttribute("style");
      document.documentElement.classList.remove("photo-scroll-locked");
      openIndex = -1;
      isAnimating = false;
    }

    if (reduceMotion || !runningAnimations.length) {
      finish();
      return;
    }

    runningAnimations.forEach((a) => a.reverse());
    Promise.allSettled(runningAnimations.map((a) => a.finished)).then(finish);
  }

  cells.forEach((cell, index) => {
    cell.addEventListener("click", (e) => {
      e.preventDefault();
      openPhoto(index);
    });
  });

  closeBtn.addEventListener("click", closePhoto);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePhoto();
  });
})();

// Single-photo viewer - reached from the Photography grid's "Index" link.
// Desktop scroll-snaps between photos; mobile is a plain stacked scroll
// (see the CSS). Either way, a fixed caption shows whichever photo is
// currently in view, tracked the same way the home slider tracks slides.
(async function () {
  const track = document.getElementById("photoSlides");
  if (!track || typeof window.loadPhotos !== "function") return;

  const photos = await window.loadPhotos();
  if (!photos.length) return;

  const headingEl = document.getElementById("photoHeading");
  const subheadingEl = document.getElementById("photoSubheading");
  const counterEl = document.getElementById("photoCounter");

  const sections = photos.map((photo, index) => {
    const section = document.createElement("section");
    section.className = "photo-slide";
    section.dataset.index = String(index);

    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = photo.heading || "";

    section.appendChild(img);
    track.appendChild(section);
    return section;
  });

  function updateCaption(index) {
    const photo = photos[index];
    headingEl.textContent = photo.heading || "";
    subheadingEl.textContent = photo.subheading || "";
    if (counterEl) counterEl.textContent = (index + 1) + "/" + photos.length;
    history.replaceState(null, "", "#" + index);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        updateCaption(Number(entry.target.dataset.index));
      }
    });
  }, { threshold: [0.6] });

  sections.forEach((section) => observer.observe(section));

  let startIndex = 0;
  const hashIndex = parseInt(window.location.hash.replace("#", ""), 10);
  if (!isNaN(hashIndex) && hashIndex >= 0 && hashIndex < photos.length) {
    startIndex = hashIndex;
  }
  sections[startIndex].scrollIntoView({ block: "start" });
  updateCaption(startIndex);
})();

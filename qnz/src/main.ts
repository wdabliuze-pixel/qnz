import "./style.css";

const collection = [
  "AFTER",
  "FONTALIS",
  "ZEROKIL",
  "DEIZIN",
  "8B",
  "KL7",
  "ZL",
  "VIERA",
] as const;

const avatarModules = import.meta.glob<string>(
  "./avatars/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" },
);

const avatarAssets = Object.entries(avatarModules)
  .flatMap(([path, source]) => {
    const fileName = path.split("/").at(-1) ?? "";
    const match = /^(\d+)\.(?:png|jpe?g|webp|gif)$/i.exec(fileName);

    if (!match) {
      return [];
    }

    return [{ order: Number(match[1]), fileName, source }];
  })
  .sort((left, right) => left.order - right.order || left.fileName.localeCompare(right.fileName));

const avatarByOrder = new Map(
  avatarAssets.map(({ order, source }) => [order, source] as const),
);

const musicModules = import.meta.glob<string>(
  "./musics/*.{mp3,mp4,mov}",
  { eager: true, query: "?url", import: "default" },
);

const musicAssets = Object.entries(musicModules)
  .flatMap(([path, source]) => {
    const fileName = path.split("/").at(-1) ?? "";
    const match = /^(\d+)\.(?:mp3|mp4|mov)$/i.exec(fileName);

    if (!match) {
      return [];
    }

    return [{ order: Number(match[1]), fileName, source }];
  })
  .sort((left, right) => left.order - right.order || left.fileName.localeCompare(right.fileName));

const musicByOrder = new Map(
  musicAssets.map(({ order, fileName, source }) => [order, { fileName, source }] as const),
);

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error('O elemento raiz "#app" não foi encontrado.');
}

const main = document.createElement("main");
main.className = "app-shell";
main.setAttribute("aria-label", "Site oficial da Quinze.");
app.append(main);

function buildAvatar(name: string, index: number, size: "card" | "detail" = "card") {
  const disc = document.createElement("div");
  disc.className = size === "card" ? "disc" : "profile-disc";
  disc.setAttribute("aria-hidden", "true");

  const avatarSource = avatarByOrder.get(index + 1);

  if (avatarSource) {
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = avatarSource;
    avatar.alt = `${name} avatar`;
    avatar.loading = "lazy";
    avatar.decoding = "async";
    disc.append(avatar);
  }

  return disc;
}

function buildMusic(order: number) {
  const track = musicByOrder.get(order);

  if (!track) {
    return null;
  }

  const media = track.fileName.toLowerCase().endsWith(".mp3")
    ? document.createElement("audio")
    : document.createElement("video");
  media.className = "background-music";
  media.src = track.source;
  media.autoplay = true;
  media.loop = true;
  media.preload = "auto";
  media.volume = 0.10;
  media.setAttribute("aria-hidden", "true");
  media.tabIndex = -1;

  if (media instanceof HTMLVideoElement) {
    media.playsInline = true;
  }

  const status = document.createElement("span");
  status.className = "music-status";
  status.setAttribute("role", "status");

  media.addEventListener("error", () => {
    status.textContent = "Não foi possível carregar esta música.";
  });

  return { media, status };
}

function stopBackgroundMusic() {
  main.querySelector<HTMLMediaElement>(".background-music")?.pause();
}

function renderCollection() {
  stopBackgroundMusic();
  main.classList.remove("profile-view");

  const pageBadge = document.createElement("span");
  pageBadge.className = "card-number";
  pageBadge.textContent = "15";
  pageBadge.setAttribute("aria-label", "Número 15");

  const lineup = document.createElement("section");
  lineup.className = "lineup";
  lineup.setAttribute("aria-label", "Peças da coleção");

  collection.forEach((name, index) => {
    const link = document.createElement("a");
    link.className = "tile-link";
    link.href = `#profile-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    link.setAttribute("aria-label", `Abrir perfil de ${name}`);

    const tile = document.createElement("article");
    tile.className = "tile";
    tile.setAttribute("aria-labelledby", `piece-name-${index}`);
    tile.style.animationDelay = `${index * 70}ms`;

    const tileBadge = document.createElement("span");
    tileBadge.className = "tile-badge";
    tileBadge.textContent = "15";
    tileBadge.setAttribute("aria-label", "Número 15");

    const disc = buildAvatar(name, index, "card");
    const heading = document.createElement(index === 0 ? "h1" : "h2");
    heading.className = "name";
    heading.id = `piece-name-${index}`;
    heading.textContent = name;

    tile.append(tileBadge, disc, heading);
    link.append(tile);
    lineup.append(link);
  });

  main.replaceChildren(pageBadge, lineup);
}

function renderProfile(name: string, index: number) {
  stopBackgroundMusic();
  main.classList.add("profile-view");

  const profilePage = document.createElement("section");
  profilePage.className = "profile-page";

  const profileCard = document.createElement("div");
  profileCard.className = "profile-card";

  const disc = buildAvatar(name, index, "detail");
  const heading = document.createElement("h1");
  heading.className = "profile-name";
  heading.textContent = name;

  const music = buildMusic(index + 1);

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "back-button";
  backButton.textContent = "Voltar";
  backButton.addEventListener("click", () => {
    window.location.hash = "";
  });

  profileCard.append(disc, heading);
  if (music) {
    profilePage.append(music.media);
    profileCard.append(music.status);
  }
  profilePage.append(backButton, profileCard);
  main.replaceChildren(profilePage);

  if (music) {
    void music.media.play().catch(() => {
      music.status.textContent = "O navegador bloqueou a reprodução automática.";
    });
  }
}

function route() {
  const hash = window.location.hash.slice(1);

  if (!hash) {
    renderCollection();
    return;
  }

  const selectedIndex = collection.findIndex((name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `profile-${slug}` === hash;
  });

  if (selectedIndex >= 0) {
    renderProfile(collection[selectedIndex], selectedIndex);
    return;
  }

  renderCollection();
}

window.addEventListener("hashchange", route);
route();
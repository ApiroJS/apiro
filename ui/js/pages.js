

// NEWWWWWW
document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     FILE TREE DATA MODEL
  ================================ */

  const FILE_TREE = {
    index: {
      title: "Index",
      fileType: "html",
      localLocked: false,
      content: `<h1>Home</h1>
<p>Welcome to the homepage.</p>`
    },

    dashboard: {
      index: {
        title: "Dashboard",
        fileType: "html",
        localLocked: false,
        content: `<h1>Dashboard</h1>
<p>Stats and metrics.</p>`
      },
      analytics: {
        title: "Analytics",
        fileType: "html",
        localLocked: false,
        content: `<h1>Analytics</h1>
<p>Traffic overview.</p>`
      }
    },

    auth: {
      login: {
        title: "Login",
        fileType: "html",
        localLocked: false,
        content: `<h1>Login</h1>`
      },
      register: {
        title: "Register",
        fileType: "html",
        localLocked: false,
        content: `<h1>Register</h1>`
      }
    }
  };

  /* ===============================
     DOM REFERENCES
  ================================ */

    const treeContainer = document.querySelector(".pages-tree .tree");
    const previewEmpty = document.querySelector(".preview-empty");
    const previewContent = document.querySelector(".preview-content");
    const previewFilename = document.getElementById("previewFilename");
    const previewBody = document.getElementById("previewBody");

    const modal = document.getElementById("newPageModal");
    const openBtn = document.getElementById("newPageBtn");
    const cancelBtn = document.getElementById("cancelNewPage");
    const form = document.getElementById("newPageForm");
    const deleteBtn = document.getElementById("deletePageBtn");
    const parentSelect = form.querySelector("select[name='parent']");

  if (!treeContainer) {
    console.error("❌ .tree container not found — aborting render");
    return;
  }

  /* ===============================
     EDITOR STATE
  ================================ */

  let activeFilePath = null;
  let activeFileRef = null;
  let currentDropPath = [];

  /* ===============================
     HELPERS
  ================================ */

  function isFile(node) {
    return node && typeof node === "object" && "fileType" in node;
  }

  function getNode(path) {
    return path.reduce((acc, key) => acc[key], FILE_TREE);
  }

  function removeNode(path) {
    const parent = getNode(path.slice(0, -1));
    delete parent[path.at(-1)];
  }

  function clearActiveFiles() {
    document.querySelectorAll(".tree-item.file.active")
      .forEach(el => el.classList.remove("active"));
  }

    /* ===============================
     FOLDER COLLECTION (NEW)
  ================================ */

  function collectFolders(tree, base = [], result = []) {
    Object.entries(tree).forEach(([key, value]) => {
      if (!isFile(value)) {
        const full = [...base, key];
        result.push({
          label: `/${full.join("/")}`,
          value: full.join("/")
        });
        collectFolders(value, full, result);
      }
    });
    return result;
  }

  function populateFolderSelect() {
    parentSelect.innerHTML = `<option value="">/ (Root)</option>`;
    collectFolders(FILE_TREE).forEach(folder => {
      const opt = document.createElement("option");
      opt.value = folder.value;
      opt.textContent = folder.label;
      parentSelect.appendChild(opt);
    });
  }

  /* ===============================
     SEARCH BAR
  ================================ */

  const searchInput = document.createElement("input");
  searchInput.placeholder = "Search pages...";
  searchInput.className = "tree-search";
  treeContainer.before(searchInput);

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll(".tree-item").forEach(el => {
      el.style.display = el.textContent.toLowerCase().includes(term)
        ? "block"
        : "none";
    });
  });

  /* ===============================
     TREE BUILDERS
  ================================ */

  function createFileElement(name, data, path) {
    const el = document.createElement("div");
    el.className = "tree-item file";
    el.draggable = true;
    el.textContent = `${name}.${data.fileType}`;
    el.dataset.path = [...path, name].join("/");

    el.addEventListener("click", () => {
      clearActiveFiles();
      el.classList.add("active");

      activeFilePath = el.dataset.path;
      activeFileRef = data;

      previewFilename.querySelector(".filename-text")?.remove();

      const span = document.createElement("span");
      span.className = "filename-text";
      span.textContent = el.textContent;
      previewFilename.prepend(span);

      previewBody.value = data.content || "";
      previewEmpty.style.display = "none";
      previewContent.classList.remove("hidden");
      deleteBtn.style.display = "inline-block";
      saveBtn.style.display = "inline-block";
    });

    setupDrag(el, path.concat(name));
    return el;
  }

    function createFolderElement(name, children, path) {
        const folder = document.createElement("div");
        folder.className = "tree-item folder";

        const label = document.createElement("div");
        label.className = "tree-label";

        const caret = document.createElement("span");
        caret.className = "caret";
        caret.textContent = "▸";

        const text = document.createElement("span");
        text.textContent = name;

        label.append(caret, text);
        folder.appendChild(label);

        const container = document.createElement("div");
        container.className = "tree-children";

        Object.entries(children).forEach(([key, value]) => {
        container.appendChild(
            isFile(value)
            ? createFileElement(key, value, [...path, name])
            : createFolderElement(key, value, [...path, name])
        );
        });

        label.addEventListener("click", () => {
        folder.classList.toggle("open");
        caret.textContent = folder.classList.contains("open") ? "▾" : "▸";
        });

        folder.appendChild(container);
        return folder;
    }

  /* ===============================
     DRAG & DROP
  ================================ */

  function setupDrag(el, path) {
    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", JSON.stringify(path));
    });

    el.addEventListener("dragover", e => e.preventDefault());

    el.addEventListener("drop", e => {
      e.preventDefault();
      const fromPath = JSON.parse(e.dataTransfer.getData("text/plain"));
      const node = getNode(fromPath);

      removeNode(fromPath);
      const target = isFile(node) ? FILE_TREE : getNode(path);
      target[fromPath.at(-1)] = node;

      renderTree(FILE_TREE);
    });
  }

  /* ===============================
     RENDER TREE
  ================================ */

  function renderTree(tree) {
    treeContainer.innerHTML = "";

    Object.entries(tree).forEach(([key, value]) => {
      treeContainer.appendChild(
        isFile(value)
          ? createFileElement(key, value, [])
          : createFolderElement(key, value, [])
      );
    });
  }

  /* ===============================
     SAVE BUTTON
  ================================ */

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn primary";
  saveBtn.textContent = "Save Changes";
  saveBtn.style.display = "none";
  previewFilename.prepend(saveBtn);

  saveBtn.addEventListener("click", () => {
    if (!activeFileRef) return;
    activeFileRef.content = previewBody.value;
    alert("Saved.");
  });

    /* ===============================
     DELETE FILE
  ================================ */

  deleteBtn.addEventListener("click", async () => {
    if (!activeFilePath) return alert("Select a file first.");
    if (!confirm(`Delete ${activeFilePath}?`)) return;

    await fetch("/api/pages/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: activeFilePath })
    });

    const parts = activeFilePath.split("/");

    function remove(tree, keys) {
      if (keys.length === 1) {
        delete tree[keys[0]];
        return;
      }
      remove(tree[keys.shift()], keys);
    }

    remove(FILE_TREE, [...parts]);

    activeFilePath = null;
    activeFileRef = null;

    previewContent.classList.add("hidden");
    previewEmpty.style.display = "flex";
    saveBtn.style.display = "none";
    deleteBtn.style.display = "none";

    renderTree(FILE_TREE);
    populateFolderSelect();
  });

   /* ===============================
     CREATE FILE (WITH FOLDER)
  ================================ */

    openBtn.addEventListener("click", () => {
        populateFolderSelect();
        modal.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        form.reset();
    });

    form.addEventListener("submit", async e => {
        e.preventDefault();

        const data = new FormData(form);
        const name = data.get("name").trim();
        const type = data.get("type");
        const parentPath = data.get("parent");

        if (!name) return;

        const key = name.toLowerCase().replace(/\s+/g, "");
        let target = FILE_TREE;

        if (parentPath) {
        parentPath.split("/").forEach(p => {
            target = target[p];
        });
        }

        if (target[key]) {
        return alert("File already exists in this folder.");
        }

        target[key] = {
        title: name,
        fileType: type,
        localLocked: false,
        content: ""
        };

        await fetch("/api/pages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: key, type, parentPath })
        });

        renderTree(FILE_TREE);
        populateFolderSelect();
        modal.classList.add("hidden");
        form.reset();
    });

  /* ===============================
     INIT
  ================================ */

  renderTree(FILE_TREE);

});

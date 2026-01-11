const files = {
  "index.html": {
    type: "html",
    slug: "index",
    content: "<h1>Hello World</h1>",
    cssImports: [],
    jsImports: []
  },
  "app.css": {
    type: "css",
    content: "body { margin: 0; }"
  },
  "app.js": {
    type: "js",
    content: "console.log('Hello');"
  }
};


const fileList = document.getElementById("fileList");
const contentEditor = document.getElementById("contentEditor");
const editorTitle = document.getElementById("editorTitle");
const slugField = document.getElementById("slugField");
const slugInput = document.getElementById("slugInput");

// Load file
function loadFile(name) {
  const file = files[name];

  document.querySelectorAll(".file-list li").forEach(li =>
    li.classList.toggle("active", li.dataset.file === name)
  );

  editorTitle.textContent = name;
  contentEditor.value = file.content;

  if (file.type === "html") {
    slugField.style.display = "block";
    slugInput.value = file.slug;
  } else {
    slugField.style.display = "none";
  }
}

// Sidebar click
fileList.addEventListener("click", e => {
  if (e.target.tagName === "LI") {
    loadFile(e.target.dataset.file);
  }
});

// Theme switching
document.getElementById("themeSelect").addEventListener("change", e => {
  document.documentElement.dataset.theme = e.target.value;
});

// Initial load
loadFile("index.html");

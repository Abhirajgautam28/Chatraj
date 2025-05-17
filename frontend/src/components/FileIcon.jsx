const FileIcon = ({ fileName }) => {
  const getIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    const iconMap = {
      // Web Development
      html: 'ri-html5-line',
      css: 'ri-css3-line',
      scss: 'ri-css3-line',
      sass: 'ri-css3-line',
      less: 'ri-css3-line',
      js: 'ri-javascript-line',
      jsx: 'ri-reactjs-line',
      ts: 'ri-typescript-line',
      tsx: 'ri-reactjs-line',
      vue: 'ri-vuejs-line',
      php: 'ri-code-s-slash-line',
      
      // Backend & Server
      py: 'ri-python-line',
      java: 'ri-code-box-line',
      class: 'ri-code-box-line',
      jar: 'ri-code-box-line',
      rs: 'ri-terminal-box-line',
      go: 'ri-code-line',
      rb: 'ri-gem-line',
      rake: 'ri-gem-line',
      pl: 'ri-code-line',
      scala: 'ri-code-line',
      cs: 'ri-code-s-slash-line',
      fs: 'ri-code-s-slash-line',
      cpp: 'ri-code-s-line',
      cc: 'ri-code-s-line',
      c: 'ri-code-s-line',
      h: 'ri-code-s-line',
      hpp: 'ri-code-s-line',
      
      // Data & Config
      json: 'ri-braces-line',
      yaml: 'ri-file-list-2-line',
      yml: 'ri-file-list-2-line',
      xml: 'ri-brackets-line',
      toml: 'ri-file-list-line',
      ini: 'ri-file-settings-line',
      env: 'ri-key-2-line',
      
      // Documentation
      md: 'ri-markdown-line',
      mdx: 'ri-markdown-line',
      txt: 'ri-file-text-line',
      doc: 'ri-file-word-line',
      docx: 'ri-file-word-line',
      pdf: 'ri-file-pdf-line',
      
      // Database
      sql: 'ri-database-2-line',
      mysql: 'ri-database-2-line',
      pgsql: 'ri-database-2-line',
      mongo: 'ri-database-2-line',
      redis: 'ri-database-line',
      
      // Package Managers
      json5: 'ri-npmjs-line',
      lock: 'ri-lock-line',
      yarn: 'ri-yarn-line',
      
      // Shell & Scripts
      sh: 'ri-terminal-line',
      bash: 'ri-terminal-line',
      zsh: 'ri-terminal-line',
      bat: 'ri-terminal-window-line',
      ps1: 'ri-terminal-window-line',
      
      // Mobile Development
      swift: 'ri-apple-line',
      kt: 'ri-android-line',
      gradle: 'ri-android-line',
      xcodeproj: 'ri-apple-line',
      
      // Version Control
      git: 'ri-git-branch-line',
      gitignore: 'ri-git-repository-line',
      
      // Build & Deploy
      dockerfile: 'ri-window-line',
      docker: 'ri-window-line',
      jenkinsfile: 'ri-server-line',
      
      // Testing
      test: 'ri-test-tube-line',
      spec: 'ri-test-tube-line',
      
      // Graphics & Assets
      svg: 'ri-image-line',
      png: 'ri-image-line',
      jpg: 'ri-image-line',
      jpeg: 'ri-image-line',
      gif: 'ri-image-2-line',
      ico: 'ri-image-line',
      webp: 'ri-image-line',
      
      // Fonts
      ttf: 'ri-font-size',
      otf: 'ri-font-size',
      woff: 'ri-font-size',
      woff2: 'ri-font-size',
      
      // 3D & Game Development
      unity: 'ri-gamepad-line',
      blend: 'ri-shapes-line',
      fbx: 'ri-shapes-line',
      obj: 'ri-shapes-line',
      
      // Cloud & Infrastructure
      tf: 'ri-cloud-line',
      cfn: 'ri-cloud-line',
      
      // State Management
      redux: 'ri-database-line',
      zustand: 'ri-database-line',
      mobx: 'ri-database-line',
      
      // Web Assembly
      wasm: 'ri-code-box-line',
      wat: 'ri-code-box-line',
      
      // Security
      key: 'ri-key-line',
      pem: 'ri-key-2-line',
      crt: 'ri-shield-check-line',
      cer: 'ri-shield-check-line',
      
      // IDL & Schema
      proto: 'ri-file-paper-line',
      graphql: 'ri-flow-chart',
      gql: 'ri-flow-chart',
      
      // Project Config
      eslintrc: 'ri-settings-line',
      prettierrc: 'ri-settings-4-line',
      babelrc: 'ri-settings-3-line',
      webpack: 'ri-settings-2-line',
      rollup: 'ri-settings-5-line',
      vite: 'ri-settings-6-line',
      
      // Package Definitions
      gemfile: 'ri-gem-line',
      podfile: 'ri-copper-coin-line',
      cargo: 'ri-ship-line',
      
      // Others
      log: 'ri-file-list-3-line',
      csv: 'ri-file-excel-line',
      tsv: 'ri-file-excel-line',
      zip: 'ri-file-zip-line',
      rar: 'ri-file-zip-line',
      tar: 'ri-file-zip-line',
      gz: 'ri-file-zip-line',
      
      // Default
      default: 'ri-file-line'
    };

    // Special cases for files without extensions
    const specialFiles = {
      'dockerfile': 'ri-window-line',
      'package.json': 'ri-npmjs-line',
      'package-lock.json': 'ri-npmjs-line',
      '.gitignore': 'ri-git-repository-line',
      '.env': 'ri-key-2-line',
      'readme': 'ri-markdown-line',
      'license': 'ri-draft-line',
      'makefile': 'ri-terminal-box-line'
    };

    const lowerFileName = fileName.toLowerCase();
    for (const [special, icon] of Object.entries(specialFiles)) {
      if (lowerFileName.includes(special)) {
        return icon;
      }
    }

    return iconMap[ext] || iconMap.default;
  };

  return (
    <i className={`${getIcon(fileName)} text-lg mr-2`}></i>
  );
};

export default FileIcon;
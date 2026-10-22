# Claire — Personal Website

Six static pages with a procedural galaxy, responsive navigation, a printable academic profile, and email contact.

Website: https://yq189183268-alt.github.io/

## Publishing configuration

- Repository: `yq189183268-alt/yq189183268-alt.github.io`
- Visibility: Public
- Default branch: `main`
- Settings → Pages → Source: **Deploy from a branch**
- Branch: **main**, folder: **/ (root)**
- No build step or custom GitHub Actions workflow is required.

`index.html`, the five other HTML pages, `.nojekyll`, and `assets/` live at the repository root. All asset and page links are relative. The previous Sites hosting configuration and workflow are not included.

## Preview locally

Open `index.html` directly in a browser, or run:

```sh
python -m http.server 8080
```

Visit http://localhost:8080/ .

## 更新网站并重新发布

修改当前目录的 HTML、CSS、JavaScript 或资源文件后，在此目录打开终端，依次运行：

```sh
git add --all
git commit -m "Update website content"
git push origin main
```

GitHub Pages 会自动发布新的提交，不需要再次设置 Pages。

- 部署进度：https://github.com/yq189183268-alt/yq189183268-alt.github.io/actions
- Pages 设置：https://github.com/yq189183268-alt/yq189183268-alt.github.io/settings/pages
- 发布后访问：https://yq189183268-alt.github.io/

如果浏览器仍显示旧内容，按 Ctrl+F5 强制刷新。

## Content and licenses

Personal information was supplied by Claire. Projects and Blog currently use explicit empty states. Resume contains only the supplied education, background, and interests.

Three.js, GSAP, and Space Grotesk are bundled locally. License notices are retained in `assets/` and `assets/vendor/`. Visual inspiration: https://techinz.dev/ .

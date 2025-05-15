# DSAA2031_Final_Project_Group1
<a id="readme-top"></a>

## 👥 Contributors

[<img src="https://github.com/XXX616519.png" width="80" alt="XXX616519" />](https://github.com/XXX616519)
[<img src="https://github.com/Altairpaca.png" width="80" alt="Altairpaca" />](https://github.com/Altairpaca)
[<img src="https://github.com/yw041202.png" width="80" alt="yw041202" />](https://github.com/yw041202)
[<img src="https://github.com/angelshen55.png" width="80" alt="angelshen55" />](https://github.com/angelshen55)




<!-- PROJECT LOGO -->
<br />
<div align="center">

<h1 align="center">Laboratory Project Payroll Management System</h1>

  <p align="center">
    <br />
    <a href="https://github.com/XXX616519/DSAA2031_Final_Project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/XXX616519/DSAA2031_Final_Project">View Demo</a>
    &middot;
    <a href="https://github.com/XXX616519/DSAA2031_Final_Project">Report Bug</a>
    &middot;
    <a href="https://github.com/XXX616519/DSAA2031_Final_Project">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary><span style="font-size: 18px;"><b>📑 Table of Contents</b></span></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

### 📂File Structure
```
DSAA2031_Final_Project/
├── .vscode/                
│   └── settings.json      
├── client/             
│   ├── index.html
|   ├── access.js
|   ├── app.js
|   ├── index.html
|   ├── personal.html
|   └── style.css
├── server/
│   ├── node_modules/
|   ├── config/
|       └── db.js
|   ├── routes/
|       ├── admin.js
|       ├── login.js
|       ├── student.js
|       └── teacher.js
|   ├── package-lock.json
|   ├── package.json
|   └── server.js
├── .gitignore                 
├── README.md            
├── create_db.sql              
└── test_data.sql       
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>



### 🧑‍💻 Programming Languages & Tools

* [![SQL][SQL]][SQL-url]
* [![Python][Python]][Python-url]
* [![JavaScript][JavaScript]][JavaScript-url]
* [![HTML][HTML]][HTML-url]
* [![CSS][CSS]][CSS-url]
* [![Git][Git]][Git-url]
* [![GitHub][GitHub]][GitHub-url]
* [![Flask][Flask]][Flask-url]
* [![Django][Django]][Django-url]
* [![Node.js][Node.js]][Node.js-url]
* [![Express.js][Express.js]][Express.js-url]
* [![VSCode][VSCode]][VSCode-url]
* [![Docker][Docker]][Docker-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
---

## 🚀 Getting Started

This is a guide to help you set up the project locally using **HTML**, **CSS**, **JavaScript**, **Python**, and **SQL**. Follow the steps below to get a local development environment up and running.

---

### 📋 Prerequisites

Make sure you have the following installed:

* **Python 3.8+**: [Install Python](https://www.python.org/downloads/)
* **Node.js & npm** (for JavaScript frontend build tools): [Install Node.js](https://nodejs.org/)
* **A Web Browser** (Chrome/Edge/Firefox)
* **SQLite** or **MySQL** (for SQL support)

---

### 🛠️ Installation Steps

1. **Clone the repository**

   ```sh
   git clone https://github.com/XXX616519/DSAA2031_Final_Project.git
   cd DSAA2031_Final_Project
   ```

2. **Set up the Python backend**

   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the SQL database**

   * For SQLite:

     ```sh
     python setup_db.py  # This will create and initialize the database
     ```
   * For MySQL, create a database manually and update the connection string in `config.py`.

4. **Install JavaScript dependencies (optional, for advanced frontend setups)**

   ```sh
   npm install
   ```

5. **Run the development server**

   ```sh
   python app.py
   ```

6. **Open the app in your browser**

   * Navigate to: [http://localhost:5000](http://localhost:5000)

---

### ✅ Done!

You're now ready to start working with:

* `HTML` for structure
* `CSS` for styling
* `JavaScript` for interactivity
* `Python` for backend logic
* `SQL` for data storage

---

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## 📬 Contact

| Name          | Email                                                |
|---------------|------------------------------------------------------|
| Keyu HU       | [khu616@connect.hkust-gz.edu.cn](mailto:khu616@connect.hkust-gz.edu.cn)     |
| Zhouan SHEN   | [zshen575@connect.hkust-gz.edu.cn](mailto:zshen575@connect.hkust-gz.edu.cn) |
| Zhenzhuo LI   | [zli743@connect.hkust-gz.edu.cn](mailto:zli743@connect.hkust-gz.edu.cn)     |
| Yingwen PENG  | [ypeng996@connect.hkust-gz.edu.cn](mailto:ypeng996@connect.hkust-gz.edu.cn) |

**Project Link**: [DSAA2031_Final_Project](https://github.com/XXX616519/DSAA2031_Final_Project)


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[SQL]: https://img.shields.io/badge/SQL-336791?style=for-the-badge&logo=mysql&logoColor=white
[SQL-url]: https://en.wikipedia.org/wiki/SQL

[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/

[JavaScript]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript

[HTML]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://developer.mozilla.org/en-US/docs/Web/HTML

[CSS]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://developer.mozilla.org/en-US/docs/Web/CSS

[Git]: https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white
[Git-url]: https://git-scm.com/

[GitHub]: https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[GitHub-url]: https://github.com/

[Flask]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[Flask-url]: https://flask.palletsprojects.com/

[Django]: https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white
[Django-url]: https://www.djangoproject.com/

[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node.js-url]: https://nodejs.org/

[Express.js]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white
[Express.js-url]: https://expressjs.com/

[VSCode]: https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white
[VSCode-url]: https://code.visualstudio.com/

[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/

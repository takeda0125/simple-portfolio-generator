![spg](https://user-images.githubusercontent.com/85210804/131278785-7ef1de44-dff2-48b0-9020-e556e2c470d5.png)
Create a simple design portfolio automatically!

## Description

This is a portfolio generator made by extending the functionality
of [github/personal-website](https://github.com/github/personal-website).

The goal is to convey more information to the viewers while keeping the beautiful design of the original as much as
possible.

![image](https://user-images.githubusercontent.com/85210804/131304763-8be89649-9f75-49d1-896e-28296f863f32.png)
![image](https://user-images.githubusercontent.com/85210804/131305277-449245c6-a3bd-4c02-b5d4-1e6bb7da69b7.png)

## Getting Started

### Automatically generate

1. Fork the [takeda0125/simple-portfolio-generator](https://github.com/takeda0125/simple-portfolio-generator) repo.
2. Open `/config/config.yml`.
3. Write your username next to `username:` and commit.
4. After the build, which starts automatically, you're done!

**NOTE**

* By default, up to 12 repositories with the highest number of stars will be displayed.
* The background of the repository card will be the image if OGP is set, otherwise it will be white.
* Regardless of the settings of `ecxclude_repos`, `max_count_repo_show` and `exclude_fork_repo`, skills will be
  generated from the language of all repositories except fork repositories.
* After the build, a `.log` file with the list of repository names displayed and the auto-generated skills will be
  output to `/config`.

### Publish

Using GitHub Pages, you can easily publish your portfolio.

#### If you set the repository name to `{your username}.github.io`
- change the `Setting -> Pages -> Source` of the repository to `gh-pages`.
- the portfolio will be published at `http(s)://{your username}.github.io`.

#### If you set the repository name to something other than `{your username}.github.io`
- add `assetPrefix: '/{your repository name}'` to `module.exports` in `. /next.config.js`.
- change the `Setting -> Pages -> Source` of the repository to `gh-pages`.
- the portfolio will be published at `http(s)://{your username}.github.io/{your repository name}`

![image](https://user-images.githubusercontent.com/85210804/131305954-20268754-1c1e-4e4e-879e-4ee0ff1dff85.png)

### Editing

You only need to work in the `/config`.

#### config.yml

* **username:** Specify the GitHub account from which you want to obtain the profile and repository data.  
  <br/>

* **user:**
    * **bio:** Overwrite the obtained bio.
    * **email:** Overwrite the obtained email. (I have anti-spam protection for the HTML, so it's probably safe.)
    * **company:** Overwrite the obtained company.
    * **location:** Overwrite the obtained location.
    * **social_media:** Specify multiple social network accounts, etc. in the form of `media_name: username`.  
      If you want to specify accounts that are not supported, edit `social-media.yml`.  

* **repos:**  
  *\# If you want to overwrite the obtained repository*
    * **repo-name:**
        * **description**: Overwrite the obtained description.
        * **bg_color**: Specify the background color of the card.
        * **language**: If you specify `""`, Language will not be inserted into the repository card.

  *\# If you want to add an application published outside of GitHub*
    * **app-name:**
        * **html_url:** Specify the URL of the app.
        * **ogp_url:** You don't need to specify OGP directly, but if for some reason you can't set OGP for the page
          with the specified URL, specify the URL of an alternative image.
        * **bg_color:** Specify the background color of the repository card.
        * **description:** Specify a description of the app.  

* **exclude_repos:** Specify repositories not to be displayed in the form of `- repo-name`.  

* **skills**
    * **name-of-language-or-framework:** Specify the skill description.  
      If you want to specify a language or framework that is not supported, please edit the `skill-logo`.  

* **exclude_skills:** Specify skills not to be displayed in the form of `- skill-name`.  

* **history:** If set to true, the job history field will be added to the portfolio and the contents
  of `/config/history.md` will be displayed.  

* **others:** If set to true, the others field will be added to the portfolio and the contents of `/config/others.md`
  will be displayed.  
  Write your self-promotion and other things that you cannot write in other fields.  

* **system:**
    * **max_count_repo_show:** Specify the maximum number of repositories to be displayed.
    * **exclude_fork_repo:** Specify whether to hide the fork repository.
    * **sort_repos_by:** Specify whether the repositories obtained should be sorted by the time of the last push or the
      number of stars.
    * **titles:** Specify the title and subtitle for each.

**NOTE**

* The `description` in `repos` can be written in MarkDown using multiline strings in yaml.
* The order of the repos is: repositories obtained, apps added by config.
* The order of the skills is: the ones with `description` specified in config, and the ones obtained automatically.

#### social-media.yml

Set the accounts that can be specified in `social_media` of `user` in `config.yml`.

* **media-name:**
    * **profile_url_prefix:** If this property is present, the link will be the URL concatenated with the string
      specified in config.
    * **icon_svg:** specify HTML such as SVG.

**NOTE**

* `icon_svg` is actually just HTML parsing, so it doesn't have to be svg.

#### skill-logo.yml

Set the logo of the skill card.

* **name:** Specify the url of logo.

## Author

[@_takeda0125](https://twitter.com/_takeda0125)

## Version History

* 0.1
    * Initial Release

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

* [github/personal-website](https://github.com/github/personal-website)
* [abhishekbhardwaj/ tailwind-react-next.js-typescript-eslint-jest-starter](https://github.com/abhishekbhardwaj/tailwind-react-next.js-typescript-eslint-jest-starter)

import React                                                     from 'react';
import _                                                         from 'lodash';
import yaml                                                      from 'js-yaml';
import * as fs                                                   from 'fs';
import {UserObj}                                                 from '@src/types/user-obj.type';
import {ReposObj}                                                from '@src/types/repos-obj.type';
import {SkillsObj}                                               from '@src/types/skill-obj.type';
import {RepoData}                                                from '@src/types/repo-data.type';
import {isConfigObj, ReposConfigObj, SystemConfigObj, TitlesObj} from '@src/types/config-obj.type';
import {isSocialMediaConfigObj, SocialMediaConfigObj}            from '@src/types/social-media-config-obj.type';
import SideCol                                                   from '@src/components/side-col/side-col';
import MainCol                                                   from '@src/components/main-col/main-col';
import {isSkillLogoConfigObj, SkillLogoConfigObj}                from '@src/types/skill-logo-obj.type';
import Head                                                      from 'next/head';
import {GetStaticPropsResult}                                    from 'next';

type HomeProps =
  {user: UserObj, socialMediaConfig: SocialMediaConfigObj, repos: ReposObj, skills: SkillsObj, skillLogoConfig: SkillLogoConfigObj, history: string, others: string, titles: TitlesObj, sort_repos_by: string}

const Home = ({
                user, socialMediaConfig, repos, skills, skillLogoConfig, history, others, titles, sort_repos_by
              }: HomeProps) => {
  return (
    <div className="d-md-flex min-height-full border-md-bottom">
      <Head>
        <title>{user.login}'s portfolio</title>
        <meta name="description" content={user.bio || ''}/>
        <meta property="og:title" content={`${user.login}'s portfolio`}/>
        <meta property="og:image" content={user.gravatar_id || user.avatar_url}/>
        <meta property="og:description" content={user.bio || ''}/>
      </Head>

      <SideCol {...{user, socialMediaConfig}}/>
      <MainCol {...{repos, skills, skillLogoConfig, history, others, titles, sort_repos_by}}/>
    </div>
  );
};

export default Home;

export async function getStaticProps(): Promise<GetStaticPropsResult<HomeProps>> {
  let config = yaml.load(fs.readFileSync('./config/config.yml', 'utf-8')) as {[key: string]: any};

  // 値がnullなプロパティの値を、exclude_reposとexclude_skillsは空配列・それ以外は空オブジェクトに変換する
  config = Object.fromEntries(
    Object.entries(config)
          .map(([k, v]) => v === null ? k.startsWith('exclude') ? [k, []] : [k, {}]
                                      : [k, v]));
  config.system.titles ||= {};

  if (!isConfigObj(config)) throw new Error();

  const user = await createUser(config.username);
  _.merge(user, config.user);

  let repos: ReposObj   = {};
  let skills: SkillsObj = [];

  if (config.system.max_count_repo_show) {
    const reposAndSkills = await createReposAndSkills(config.username, config.system, config.exclude_repos);
    repos                = reposAndSkills.repos;
    skills               = reposAndSkills.skills;
  }

  fs.writeFileSync('./config/.log', yaml.dump(Object.keys(repos)));
  _.merge(repos, await correctReposConfig(config.repos));

  skills = skills.filter(x => !config.exclude_skills.includes(x[0]));
  fs.appendFileSync('./config/.log', '\n');
  fs.appendFileSync('./config/.log', yaml.dump(skills.map(x => x[0])));
  skills = _.uniqBy(Object.entries(config.skills).concat(skills), x => x[0]);

  const history = config.history ? fs.readFileSync('./config/history.md', 'utf-8')
                                 : '';
  const others  = config.others ? fs.readFileSync('./config/others.md', 'utf-8')
                                : '';

  const socialMediaConfig = yaml.load(fs.readFileSync('./config/social-media.yml', 'utf-8'));
  if (!isSocialMediaConfigObj(socialMediaConfig)) throw new Error();
  const skillLogoConfig = yaml.load(fs.readFileSync('./config/skill-logo.yml', 'utf-8'));
  if (!isSkillLogoConfigObj(skillLogoConfig)) throw new Error();

  return {
    props: {
      user, socialMediaConfig, repos, skills, skillLogoConfig, history, others,
      titles       : config.system.titles,
      sort_repos_by: config.system.sort_repos_by
    },
    revalidate: 3
  };
}

async function createUser(username: string): Promise<UserObj> {
  const {
          login, name, avatar_url, gravatar_id, bio, html_url,
          email, company, location, blog, twitter_username
        } = await fetch(`https://api.github.com/users/${username}`).then(res => res.json());

  if (!login) throw new Error('user is not exist');

  // 値がfalsyなプロパディ除いたオブジェクト
  const social_media = _.pickBy({Blog: blog, Twitter: twitter_username});

  return {
    login, name, avatar_url, gravatar_id, bio, html_url,
    email, company, location, social_media
  };
}

async function createReposAndSkills(username: string, system: SystemConfigObj, excludeRepos: Array<string>): Promise<{repos: ReposObj, skills: SkillsObj}> {
  let reposData: Array<RepoData>        = [];
  const skills: {[key: string]: string} = {};
  let url: string | null                = `https://api.github.com/users/${username}/repos?page=1`;

  do {
    let res: Array<RepoData> = await fetch(`${url}&sort=pushed&per_page=100`).then(res => {
      const matches = /<([^<>]+)>; rel="next"/.exec(res.headers.get('link') as string);
      url           = matches ? matches[1] : null;

      return res.json();
    });

    if (system.exclude_fork_repo) res = res.filter(r => !r.fork);

    reposData = reposData.concat(res);
  } while (url);

  for (const repo of reposData) if (!repo.fork && repo.language) skills[repo.language] = '';
  reposData = reposData.filter(x => !excludeRepos.includes(x.name));

  if (system.sort_repos_by === 'star')
    reposData.sort((a, b) => b.stargazers_count - a.stargazers_count);

  reposData.splice(system.max_count_repo_show);

  const promises = reposData.map(async repoData => {
    let {name, html_url, description, language, stargazers_count, pushed_at} = repoData;

    const ogp_url = await getOgpUrl(html_url);
    description   = description || ''; // nullの場合に空文字にする

    return [name, {html_url, ogp_url, description, language, stargazers_count, pushed_at}];
  });

  return {repos: Object.fromEntries(await Promise.all(promises)), skills: Object.entries(skills)};
}

// configで新しく設定されるリポジトリーのOGPを取得する
async function correctReposConfig(reposConfig: ReposConfigObj) {
  const promises = Object.entries(reposConfig).map(async ([key, value]) => {
    if (!('html_url' in value)) return [key, value];

    let {html_url, description, bg_color, ogp_url} = value;
    bg_color                                       = bg_color ? bg_color : '';
    ogp_url ||= await getOgpUrl(html_url);

    return [key, {html_url, ogp_url, bg_color, description}];
  });

  return Object.fromEntries(await Promise.all(promises));
}

async function getOgpUrl(htmlUrl: string): Promise<string> {
  const res        = await fetch(htmlUrl).then(res => res.text());
  const resultExec = /<meta +property *= *"og:image" +content *= *"(https?:\/\/[\w!?/+\-_~=;.,*&@#$%()'\[\]]+)" *\/?>/.exec(res);

  return resultExec ? resultExec[1] : '';
}

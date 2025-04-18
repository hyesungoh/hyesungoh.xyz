import { data as etcData, IEtc } from '../../_content/Etc';
import { data as FavorData } from '../../_content/Favor';
import { data as headerData, IHeader } from '../../_content/Header';
import { data as linkData } from '../../_content/Link';
import { data as otherExperienceDate, IOtherExperience } from '../../_content/Other-Experience';
import { data as sideProjectsData, IWorkExperience } from '../../_content/Side-Projects';
import { data as skillsData, ISkills } from '../../_content/Skills';
import { data as workExperienceData } from '../../_content/Work-Experience';
import Header from '../components/Header';
import OtherExperienceSection from '../components/OtherExperienceSection';
import SkillsSection from '../components/SkillsSection/SkillsSection';
import WorkExperienceSection from '../components/WorkExperienceSection';

interface Props {
  header: IHeader;
  link: IEtc;
  workExperience: IWorkExperience;
  sideProjects: IWorkExperience;
  otherExperience: IOtherExperience;
  favorExperience: IOtherExperience;
  skills: ISkills;
  etc: IEtc;
}

function Resume({ header, link, favorExperience, workExperience, sideProjects, otherExperience, skills, etc }: Props) {
  return (
    <>
      <main>
        <Header {...header} />
        <SkillsSection {...link} />
        <OtherExperienceSection {...favorExperience} />
        <WorkExperienceSection {...workExperience} />
        <WorkExperienceSection {...sideProjects} />
        <OtherExperienceSection {...otherExperience} />
        <SkillsSection {...skills} />
        <SkillsSection {...etc} />
      </main>
    </>
  );
}

export default Resume;

export async function getStaticProps() {
  return {
    props: {
      header: headerData,
      link: linkData,
      workExperience: workExperienceData,
      sideProjects: sideProjectsData,
      otherExperience: otherExperienceDate,
      favorExperience: FavorData,
      skills: skillsData,
      etc: etcData,
    },
  };
}

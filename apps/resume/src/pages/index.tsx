import { data as etcData, IEtc } from '../../_content/Etc';
import { data as headerData, IHeader } from '../../_content/Header';
import { data as otherExperienceDate, IOtherExperience } from '../../_content/Other-Experience';
import { data as sideProjectsData, IWorkExperience } from '../../_content/Side-Projects';
import { data as skillsData, ISkills } from '../../_content/Skills';
import { data as workExperienceData } from '../../_content/Work-Experience';
import ContactButton from '../components/ContactButton';
import Header from '../components/Header';
import OtherExperienceSection from '../components/OtherExperienceSection';
import SkillsSection from '../components/SkillsSection/SkillsSection';
import WorkExperienceSection from '../components/WorkExperienceSection';

interface Props {
  header: IHeader;
  workExperience: IWorkExperience;
  sideProjects: IWorkExperience;
  otherExperience: IOtherExperience;
  skills: ISkills;
  etc: IEtc;
}

function Resume({ header, workExperience, sideProjects, otherExperience, skills, etc }: Props) {
  return (
    <>
      <main>
        <Header {...header} />
        <WorkExperienceSection {...workExperience} />
        <WorkExperienceSection {...sideProjects} />
        <OtherExperienceSection {...otherExperience} />
        <SkillsSection {...skills} />
        <SkillsSection {...etc} />
      </main>

      <ContactButton />
    </>
  );
}

export default Resume;

export async function getStaticProps() {
  return {
    props: {
      header: headerData,
      workExperience: workExperienceData,
      sideProjects: sideProjectsData,
      otherExperience: otherExperienceDate,
      skills: skillsData,
      etc: etcData,
    },
  };
}

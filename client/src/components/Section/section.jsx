import style from './section.module.css'


const Section = ({name, children}) => {


  return (
   <div className={style.section}> 
    <div className={style.name}>
        {name}
    </div>
    <div className={style.sectionContent}>
       {children}
    </div>
   </div>
  )
};

export default Section;
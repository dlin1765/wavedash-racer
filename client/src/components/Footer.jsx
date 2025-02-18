import svgLogo from '../assets/twitter-logo.svg';

function Footer(){
    return(
        <>
            <div className="flex bg-headerColor h-topHeight">
                <div className="flex flex-1 flex-row justify-between py-0 pl-paddingLength pr-paddingLength ">
                    <a className ='logoContainer flex items-center gap-2 justify-center'
                        href='https://twitter.com/WeenDaniel'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className='contact'>
                            CONTACT
                        </div>
                        <object data= {svgLogo} type="image/svg+xml" className='logo w-4 h-4 pointer-events-none'>
            
                        </object>
                    </a>
                    <div className="contactContainer">
                
                        <a className ='logoContainer'
                            href='https://github.com/dlin1765/lobby-link-generator'
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <div className='contact'>
                                GITHUB
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            
        </>
    );
}

export default Footer
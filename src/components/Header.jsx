function Header(){
    return(
        <>
            <div className="flex bg-headerColor">
                <div className="flex flex-1 flex-row justify-between py-0 pl-paddingLength pr-paddingLength ">
                    <a className ='logoContainer flex items-center gap-2 justify-center'
                        href='https://twitter.com/WeenDaniel'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className='contact'>
                            WAVU RACER
                        </div>
                    </a>
                    
                </div>
            </div>
            
        </>
    );
}

export default Header
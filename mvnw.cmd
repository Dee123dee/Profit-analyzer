@echo off
set "LOCAL_MVN=C:\Users\DEEPAK G\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
if exist "%LOCAL_MVN%" (
    call "%LOCAL_MVN%" %*
) else (
    mvn %*
)


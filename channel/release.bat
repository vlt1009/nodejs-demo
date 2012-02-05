REM ±àÒëÎªrelease°æ±¾
call build.bat release release

set outpath=release-service
rd %outpath% /s/q
xcopy service\*.* %outpath%\service /e/r/y/i
xcopy common\*.* %outpath%\common /e/r/y/i
set currDir=%cd%
pushd %outpath%
for /r %%i in (*.js) do java -jar %currDir%\..\yuicompressor-2.4.6.jar --type js --charset utf-8 -o %%i %%i
for /r %%i in (*.css) do java -jar %currDir%\..\yuicompressor-2.4.6.jar --type css --charset utf-8 -o %%i %%i
popd

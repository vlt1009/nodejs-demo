if "%1" == "" goto end
set outpath=%1
set namespace=chat
rd %outpath% /s/q

xcopy browser\components\*.* %outpath%\components /e/r/y/i
xcopy resources\common\images\*.* %outpath%\resources\common\images /e/r/y/i
xcopy resources\themes\default\images\*.* %outpath%\resources\themes\default\images /e/r/y/i
xcopy resources\themes\i18n\*.* %outpath%\resources\themes\i18n /e/r/y/i
md %outpath%\resources\themes\default\styles

..\node.exe ..\build.js browser\%namespace%-debug.html %outpath%\%namespace%.html %outpath%\%namespace%.js %outpath%\resources\themes\default\styles\%namespace%.css %2

if "%2" == "debug" goto end
if "%2" == "nocompressor" goto end
set currDir=%cd%
pushd %outpath%
for /r %%i in (*.js) do java -jar %currDir%\..\yuicompressor-2.4.6.jar --type js --charset utf-8 -o %%i %%i
for /r %%i in (*.css) do java -jar %currDir%\..\yuicompressor-2.4.6.jar --type css --charset utf-8 -o %%i %%i
popd
:end

pause
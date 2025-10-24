
# 코드 수정 후 배포 명령어
cd blood-pressure-tracker

npm run build

npm run deploy


배포가 잘 안 될 때
# 1. node_modules와 build 폴더 삭제
Remove-Item -Recurse -Force node_modules, build -ErrorAction SilentlyContinue

# 2. 다시 설치 및 빌드
npm install
npm run build

# 3. 배포 (오타 수정 - depoly가 아닌 deploy)
npm run deploy

배포 방식 깃허브 액션 플로우 일떄 
git add .
git commit -m "Add GitHub Actions workflow for deployment"
git push origin main

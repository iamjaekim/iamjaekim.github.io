---
layout: post
title: terraform - provider
---

안녕 테라폼?

안녕하세요, 김재욱입니다. 오늘의 주제는 테라폼 [Provider - 프로바이더](https://www.terraform.io/docs/providers/index.html) 입니다.

`안녕 테라폼?` 시리즈는 "나는 적어도 CLI로 클라우드에서 리소스 만져봤다" 하시는분들이 다음 과정으로 넘어가실 때 읽으실 때, 이해되기 쉽게 작성해보려 합니다.

테라폼 프로바이더는, 비유적으로, 아무것도 없는 `테라폼`이라는 몸에 옷을 입혀주는 개념과 비슷합니다.
처음 테라폼을 설치하면, 할수 있는 작업은 매우 제한적입니다. 기본적인 CLI가 ( 사용법은 `terraform help`로 볼 수 있습니다.) 끝입니다. 프로바이더가 설치 되어야 비로소 리소스 API와 통신을 하며 맞춤형 리소스를 만들수 있게 됩니다.

예를 들면,

> 테라폼을 사용해서 AWS에 VPC를 만들고 싶으면:
>
> >테라폼 설치 후, AWS 프로바이더를 정의 한 다음, VPC 리소스가 정의되어야, 비로소 VPC리소스를 테라폼으로 만들수 있게 됩니다.
>
> HCL로 정의한 리소스는 프로바이더를 통해 번역이 되어 해당 리소스를 해당 플랫폼에 만들게 됩니다.

테라폼은 HashiCorp에서 관리를 하지만 프로바이더들의 경우는 다릅니다. 대부분의 프로바이더는 오픈소스이며, 누구나 참여하여 버그를 고치거나, 새로운 기능을 만들어, 더 좋은 프로바이더를 만드는데 참여 할 수 있습니다.

현재 테라폼이 지원하는 프로바이더 리스트는 [여기](https://www.terraform.io/docs/providers/index.html#lists-of-terraform-providers)와 [여기](https://www.terraform.io/docs/providers/type/community-index.html)에서 찾아볼 수 있습니다. 이렇게 만들어진 프로바이더와 테라폼을 같이 사용하며 플랫폼에 리소스를 만들수 있게 됩니다.

_각각의 테라폼 프로바이더는 개별적인 프로젝트이자 커뮤니티이며, 완성도, 성숙도, 참여도 등 다를수 있습니다._

프로바이더를 사용 할 때 꼭 설정해야할것들이 몇가지 있습니다. 사용자 인증 또는 지역설정등 플랫폼 CLI 사용에 필수적인 값들이 그것입니다. 쉽게 생각하면, 해당 플랫폼 CLI를 사용할때  `export` 또는  `environment variable (환경변수)`로 설정해주는 값들이 테라폼 프로바이더에서 역시 꼭 필요한 설정입니다. 보통의 필수 값들은, 각각의 프로바이더 공식문서를 참조하여 시작하시길 바랍니다.

많이 쓰는 [AWS를 예로 들면](https://registry.terraform.io/providers/hashicorp/aws/latest/docs), 프로바이더 버전,access key,secret key, region 등을 필수로 지정해주거나, `export` 정의된 값들 또는 `~/.aws/`폴더에 있는 유저 정보를 기반으로 사용자 인증을 진행합니다.

테라폼은 [AWS 유저 인증하는 방법](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication)에 대해 상당히 유연하게 대처 하고 있습니다.
- 1차적으로 프로바이더에 직접 넣을수 있습니다. **하지만** 이 방법은 테스트 이외에 추천 드리지 않으며, 본인의 access key 와 secret key가 외부에 노출될 경우가 있기때문에 최소로 사용을 권장합니다. 또한 키들이 노출된경우 ***가장 빠른 시간***안에 삭제후 재생성을 요청드립니다.
- 2차적으로 테라폼은 환경변수에서 필요한 정보를 읽어 올 수 있습니다.
- 3차적으로 `~/.aws/` 또는 `$USERPROFILE/.aws` 폴더에서 설정파일을 읽어 유저인증을 진행 할 수 있습니다.
- 4차적으로 테라폼이 실행 되는 환경에 있는 ROLE에서 인증정보를 받아 유저인증을 진행 할 수 있습니다. 이 경우 CD가 구성되어 개개인의 키보다 CD유저 또는 시스템 역할로 인증하는 경우가 많이 있습니다.

앞서 설명드렸다시피, 테라폼 프로바이더는 AWS API와 통신하는데, 여기서 헷갈리지 말아야 할 컨셉중 하나는, 테라폼의 유저인증과 IAM기반으로 만들어진 RBAC권한 입니다. 테라폼 유저인증은, 쉽게 설명하여 AWS 어카운트에 로그인을 하는 정도이며, **세세한 권한에 대해선 해당 IAM유저 또는 Assumed Role에 주어진 RBAC에 따르게 됩니다.**

코드샘플:
<pre><code>
# provider 블럭으로 유저인증을 진행합니다.
provider "aws" {
  region     = "지역"
  access_key = "엑세스 키"
  secret_key = "시크릿 키"
}
# 위 프로바이더 정보를 활용해 유저인증한 뒤 vpc 리소스를 만듭니다.
resource "aws_vpc" "demovpc" {
  cidr_block = "10.0.0.0/16"
}</code></pre>

끝까지 읽어주셔서 감사합니다, 질문은 이메일, 링크드인 메시지, [깃헙이슈](https://github.com/iamjaekim/iamjaekim.github.io/issues)로 열어주시면, 아는 한도내에서 답 해드리겠습니다!

오늘도 좋은 하루 되세요!

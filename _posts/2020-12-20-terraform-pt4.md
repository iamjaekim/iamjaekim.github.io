---
layout: post
title: terraform - data, local and output
tags: [terraform]
---

안녕 테라폼?

안녕하세요, 김재욱입니다. 오늘의 주제는 테라폼 [Data - 데이터](https://www.terraform.io/docs/configuration/data-sources.html), [Local - 로컬](https://www.terraform.io/docs/configuration/locals.html) 그리고 [Output - 아웃풋](https://www.terraform.io/docs/configuration/outputs.html) 입니다

> `안녕 테라폼?` 시리즈는 "나는 적어도 CLI로 클라우드에서 리소스 만져봤다" 하시는분들이 다음 과정으로 넘어가실 때 읽으시면, 이해되기 쉽게 작성해보려 합니다.

데이터, 로컬, 그리고 아웃풋은 테라폼 내부에서 변수로 쓰일 수 있는 변수들 입니다.
-  데이터는 원격으로 `GET` 쿼리를 실행후 받아오는 변수들을 저장을 합니다.
-  로컬은 실행 환경에 귀속된 변수를 저장합니다.
-  아웃풋은 만들어진 리소스의 값을 변수 저장후 외부 모듈등에서 사용가능하게 노출시켜줍니다.

---
## Data
데이터에 대해 알아보겠습니다. 데이터의 기본은 `GET`쿼리입니다. 실제 존재하는 리소스에 대해서 `GET` 으로 해당 리소스에 대한 모든 데이터를 불러와 변수로 저장을 합니다. 데이터 선언과 사용은 밑과 같이 하게 됩니다. (저번 포스팅에서 예로 들었던, [`aws_vpc` 리소스 예시](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc)로 들어보겠습니다.)
```terraform
data "aws_vpc" "selected" {
  id = vpc-1234824 # 실제 존재하는 vpcid
}

resource "aws_subnet" "example" {
  vpc_id            = data.aws_vpc.selected.id # 쿼리된 `aws_vpc.selected` 오브젝트에서 id항목을 참조
  availability_zone = "us-east-1a"
  cidr_block        = cidrsubnet(data.aws_vpc.selected.cidr_block, 4, 1)
}
```
해당 코드블럭은, 이전에 프로바이더로 지정된 어카운트 및 IAM유저로, vpc리소스를 쿼리해서, [응답에 대한 결과를 변수](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc#attributes-reference)로 저장한 뒤, 서브넷 만들때 필수항목인 vpc_id에 쿼리된 vpc의 id를 지정을 합니다. 새로 vpc를 만드는것이 아닌, 기존에 있는 vpc를 써야할때 가장 좋은 전략이기도 합니다.

데이터의 출처는, 사용중인 프로바이더의 의존하게되며, 테라폼은 해당 항목들은 가공하며 `attribute`항목으로 노출을 시켜줍니다. 하여, 환경이 바뀔때마다 쿼리 되는 데이터 역시 바뀌 state 파일에 저장이 됩니다. 혹여, 쿼리된 데이터가 바뀌게 되면, 해당데이터를 참조하는 실리소스들에 영향이 갈 수도 있으며, 사용중인 테라폼 외부에서 만들어진 리소스라면, 한번 더 해당 변경작업에 대한 임펙트 역시 생각해볼 필요가 있습니다.

데이터의 많은 use case가 있지만 가장 큰 장점은 다이나믹함 입니다.
가령 AWS어카운트 하나에 vpc를 나눠서 서로 다른 운영환경을 구성한다면, id를 직접 쿼리 하기보단, 태그를 쿼리하여 변수를 저장한뒤, 필요시 Local변수로 변환저장 후, 테라폼 내부에서 개별적으로 사용이 가능하기 때문이입니다.

```terraform
data "aws_vpcs" "prod-vpcs" {
  tags = {
    service = "production"
  }
}
```
해당 코드블럭은 `service: production`이라는 태그를 가진 *모든* vpc를 쿼리하여 data.aws_vpcs.prod-vpcs 라는 변수에 array형식으로 저장되며, 필요시 `loop`,`element` 등의 [기본 테라폼 펑션](https://www.terraform.io/docs/configuration/functions.html)으로 선택적 사용이 가능합니다.

---
## Local
로컬변수에 대해 알아보겠습니다. 앞서 한줄설명 한 것 처럼, 현재 실행환경에만 귀속이 되어 있는 변수입니다. 이 컨셉은, 다른 프로그래밍 언어에도 널리 이용되고 있는 컨셉이기도 합니다. 로컬 변수 선언은 이러한 형식을 띄우게 됩니다.
```terraform
locals {
    tags = {
        name = "my_service"
        env = "prod"
        owner = "infrastructure_team"
        automation = "terraform"
    }
    query_vpc = data.aws_vpc.prod-vpc
}

data "aws_vpc" "prod-vpc" {
  tags = local.tags
}

resource "aws_subnet" "example" {
  vpc_id            = local.query_vpc
  availability_zone = "us-east-1a"
  cidr_block        = cidrsubnet(local.query_vpc.cidr_block, 4, 1)
  tags              = local.tags
}
```

해당 코드블럭은, 현재 실행환경에 `tags`를 저장하는것입니다. 가령 일반 string뿐만 아니라, `data`역시 로컬변수에 저장이 가능하여, 잘 사용 한다면, 모든 configuration을 로컬에 저장한 뒤, 실제 리소스에선 로컬 변수에 저장된 값들로만 리소스를 만들수도 있습니다.

많은 use case들중 유용히 쓰일경우중 하나가 [리소스들에 tag를 지정](https://www.terraform.io/docs/configuration/locals.html#when-to-use-local-values)할때 입니다. 각각의 리소스들의 일정함을 위해, 같은 포맷 또는 비슷한게 만들어진 값 사용을 추천하는데, 테라폼으로 태깅을 할 경우, 이 작업이 무척 쉬워지게 됩니다.

이런식으로 로컬에 선언된 tags변수를 이용해 여러 리소스들에 넣어주게 되면, 해당 테라폼코드로 만들어진 모든 리소스들에 대하여, 전부 같은 태그를 줄수 있게 됩니다. 또한, 태그가 업데이트될시, 이미 만들어진 모든 리소스에 그 업데이트가 한번에 적용 될수도 있으니, 꽤나 유용한 장점이기도 합니다.

---
## Output

아웃풋에 대해 알아보겠습니다. 아웃풋은 모듈에서 만들어진 리소스 정보를, 다른 모듈 또는 다른 리소스가 필요할때 참조를 가능하게, 해당 값들을 외부로 노출 시켜주는 역할을 합니다. 모듈A에서 만든 aws_vpc 정보를 모듈B에서 쓰고싶을 경우, 모듈A에 아웃풋을 정해주면, 해당 아웃풋이 state 파일에 기록이 되게 됩니다. 또한, 테라폼의 모든 리소스를 아웃풋으로 만들수 있습니다. 데이터, 리소스 그리고 로컬까지 아웃풋으로 만들어, 다른 모듈 또는 다른 테라폼 코드에서 사용할수 있게 됩니다.
```terraform
data "aws_vpc" "prod-vpc" {
  tags = local.tags
}

output "vpc_arn" {
  value = data.aws_vpc.prod-vpc.arn
}
```
해당 코드블럭은, 데이터로 aws_vpc 정보를 가져와, 해당 vpc의 arn정보를 외부로 노출 시켜주는 예제입니다. 이렇게 노출이 되게되면, 해당 vpc의 arn은 다른 테라폼 코드, 다른 모듈에서 접근이 가능하며, 좀더 다이나믹한 테라폼 코드를 작성할수 있게 됩니다.

아웃풋의 가장 큰 장점은, 이렇게 노출된 값을, 다른 테라폼 코드에서도 참조가 가능하다는 점입니다. [가령 다수의 backend와 state 파일을 쓰는 환경에서 vpc arn이 필요할경우, 새로운 data를 쓸 수도 있겠지만, vpc arn이 노출된 state파일에 data를 불러와 사용할수 있습니다.](https://www.terraform.io/docs/providers/terraform/d/remote_state.html)

이렇게 오늘은, 데이터, 로컬 그리고 아웃풋에 대해 글을 작성해 보았습니다. 테라폼 공식 문서에 좀더 자세한 예제와 설명이 있으니 참조 하면서 테라폼 작성하시면 좋을것 같습니다.

끝까지 읽어주셔서 감사합니다, 질문은 이메일, 링크드인 메시지, [깃헙이슈](https://github.com/iamjaekim/iamjaekim.github.io/issues)로 열어주시면, 아는 한도내에서 답 해드리겠습니다!

오늘도 좋은 하루 되세요!

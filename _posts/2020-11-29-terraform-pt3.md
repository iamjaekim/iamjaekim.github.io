---
layout: post
title: terraform - resource
tags: [terraform]
---

안녕 테라폼?

안녕하세요, 김재욱입니다. 오늘의 주제는 테라폼 [Resource - 리소스](https://www.terraform.io/docs/configuration/resources.html) 입니다.

> `안녕 테라폼?` 시리즈는 "나는 적어도 CLI로 클라우드에서 리소스 만져봤다" 하시는분들이 다음 과정으로 넘어가실 때 읽으실 때, 이해되기 쉽게 작성해보려 합니다.

테라폼 리소스는, 말 그대로, 해당 리소스의 설정값을 지정할수 있는 블럭입니다.


이전에 했던, [테라폼 설치]({{ 'terraform-pt1' | relative_url }})와 [프로바이더 설정]({{ 'terraform-pt2' | relative_url }})은 리소스를 만들기 위한 필수 조건이며, 테라폼의 진가는 리소스를 만들 때 나타납니다. 만들 수 있는 리소스의 한계는 각각의 프로바이더 공식문서를 보며 알수 있습니다. 예를 들어 [AWS 프로바이더](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) 같은 경우, 거이 모든 AWS 리소스에 대해 커뮤니티가 빠르고 활발히 대처하고 있습니다.

> _NOTE: 예시는 AWS를 사용하며, 해당 프로바이더는 설정이 되어있다고 가정합니다. 프로바이더에 대해 다시한번 읽어보길 원하실 경우 [클릭]({{ 'terraform-pt2' | relative_url }})하시면 이동합니다._

리소스 선언은 이러한 형식을 띄우게 됩니다.
```terraform
resource "aws_vpc" "demovpc" {
  cidr_block = "10.0.0.0/16"
}
```

해당 예시를 분해하여 설명하면 :
- `resource`는 이것이 리소스 블럭임을 선언하는 단계입니다. 테라폼 내부에선 타입별로 reserve 된 단어들이 존재하며, 이 첫 단어는 해당블럭의 용도를 정의하는데 사용합니다.
  - 추가 예시로, 프로바이더에서도 보셨다시피, 프로바이더는 첫 단어가 `provider`로 시작합니다.
- `aws_vpc`는 만들고자 하는 [aws 리소스](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc) 입니다. 프로바이더 문서를 보면, 만들수 있는 리소스들이 정의 되어 있으며, 각각의 리소스의 필수값과 옵션값등이 명시 되어 있습니다.
- `demovpc`는 테라폼 내부에서 사용하는, `aws_vpc`의 이름입니다. 이 이름 같은경우, 하나의 state파일 내부에서 유니크해야합니다. 이 이름은 리소스를 논리적으로 구분할 떄, state파일 내부에서 꽤나 중요하게 이용되며, **이 이름이 바뀔경우 보통 테라폼은, 리소스가 사라진것으로 간주하고, 기존에 있는 리소스를 삭제후 다시 만드려고 합니다.**
  - 바뀌었을 경우 참조값을 옴겨주는 작업 (`terraform state mv`) 또는 state파일에서 참조값을 삭제 후 (`terraform state rm`), 다시 참조값을 만들어주는 작업이(`terraform import`) 필수로 필요로 합니다.
- `{ }`블럭 안에 들어가는 내용들이 직접적인 해당 리소스의 설정값이 됩니다. 각각의 [리소스](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc)마다 파라미터 값이 달라지며, AWS CLI로 작업을 해 봤다면, CLI 파라미터로 넘기던 값들을 블럭안에 정의하고 만든 다음, 테라폼을 이용하여 관리까지 할 수 있게 됩니다. 파라미터 값들이 변동됨에 따라 테라폼이 변동을 인식하고, 업데이트를 해야할지, 삭제하고 다시 만들어야할지 판단하여 유저에게 알려줍니다.

---

리소스 블럭에서부터 테라폼의 진가인 [meta argument - 메타변수](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc) 역시 사용 가능합니다. 메타변수는 테라폼에 로직을 불어 넣는 역할을 합니다. 이 설정같은 경우 프로바이더를 따라가지 않고, 테라폼의 기본 기능에 속하며, 모든 프로바이더는 메타변수에 대응할수 있게끔 짜여지게 되어있습니다.

모든 메타변수를 적재적소에 써야하지만, 요즘 특히 유용하게 쓰이는 메타변수들은 다음과 같습니다. :
- `provider`의 쓰임새는 기본적으로 설정된 프로바이더 말고, 다른 설정의 프로바이더를 사용해야할때 사용됩니다. 프로바이더에 alias 파라미터를 넘겨주어 참조값을 만들어 주어야 합니다. 예를 들어 AWS같은 경우, us-east-1에 어떠한 리소스가 us-west-2에 동시에 만들어져야 할 경우 유용히 쓰일 수 있습니다.

```terraform
# 기본적으로 쓸 aws 프로바이더
provider "aws" {
  region = us-east-1
}

# 다른 세팅을 가진 aws 프로바이더
provider "aws" {
  alias = uswest2
  region = us-west-2
}

resource "aws_vpc" "useast1" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_vpc" "uswest2" {
  provider = aws.uswest2 # 이런식으로 참조값을 넘겨주어야 합니다.
  cidr_block = "10.0.0.0/16"
}
```
- `count` 와 `for_each`같은경우, 같은 리소스를 여러개 만들어야 하는 경우에 많이 쓰입니다. 둘은 동시에 쓰일 수 없으며, 동시에 쓰일경우 에러가 나게 됩니다.
  - [`count`](https://www.terraform.io/docs/configuration/resources.html#count-multiple-resource-instances-by-count)를 파라미터를 리소스에 할당하게 되면, 테라폼이 자체적으로 인식하며 주어진 갯수에 맞게끔 해당 리소스를 만듭니다. 따로 바꾸지않는이상 모든 설정값은 같은 값을 쓰기때문에, 리소스에 동일한 값이 존재하면 안될경우, 설정값도 다이나믹하게 설정될수 있게 만들어주어야 합니다. 그렇게 만들어진 리소스들은 array형식으로 state파일에 기록되며 필요시 `count.index`로 array index를 참조하여 다이나믹한 설정값을 사용할수 있게 도와줍니다.
    - 예시같은경우, 테라폼의 [`element` 펑션](https://www.terraform.io/docs/configuration/functions/element.html)을 이용하며 array변수로 지정해둔 cidr에서 해당 어레이에 있는 값을 `cider_block`에 지정하는 과정을 거치게 됩니다.
```terraform
variable cidrs {
  default = ["10.0.1.0/24","10.0.2.0/24"]
}
resource "aws_vpc" "demovpc" {
  count = 2
  cidr_block = element (var.ciders, count.index)
}
```
  - [`for_each`](https://www.terraform.io/docs/configuration/resources.html#for_each-multiple-resource-instances-defined-by-a-map-or-set-of-strings)는 맵 또는 set of string을 받아서, 해당 변수에 있는 값들을 순차적으로 부를수 있습니다. 이렇게 만들어진 리소스 역시 `count`처럼 array형식으로 state에 기록되지만, `count`와는 다르게 array index가 아닌 키 값으로 기록이 되게 됩니다.
```terraform
resource "aws_vpc" "demovpc" {
  for_each = {
    a = "10.0.1.0/24"
    b = "10.0.2.0/24"
  }
  cidr_block = each.value
}
```

이렇게, 테라폼 리소스는 단순하면서도 복잡한 구조를 가질수 있습니다. 프로바이더 버전마다 설정의 이름이나, 고쳐진 버그들이 있을 수도 있기 때문에, 새로운 리소스를 만들때엔, 항상 사용중인 프로바이더의 버전별 공식 문서를 참조해야 합니다.

끝까지 읽어주셔서 감사합니다, 질문은 이메일, 링크드인 메시지, [깃헙이슈](https://github.com/iamjaekim/iamjaekim.github.io/issues)로 열어주시면, 아는 한도내에서 답 해드리겠습니다!

오늘도 좋은 하루 되세요!

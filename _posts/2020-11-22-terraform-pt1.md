---
layout: post
title: terraform - intro
tags: [terraform]
---

안녕 테라폼?

안녕하세요, 김재욱입니다. 이 블로그의 첫 글로, 요즘 많이 쓰고 있는 테라폼에 대해 소개 해보려고 합니다.

![terraform-logo](../images/terraform-color.svg){: width="100%" height="100%"}


> `안녕 테라폼?` 시리즈는 "나는 적어도 CLI로 클라우드에서 리소스 만져봤다" 하시는분들이 다음 과정으로 넘어가실 때 읽으시면, 이해되기 쉽게 작성해보려 합니다.

[테라폼](https://www.terraform.io/intro/index.html)은 HashiCorp에서 만든 오픈소스 툴로 독자적인 HCL과 프로바이더의 결합으로 각종 리소스를 만드는데 사용하는 툴입니다.

요즘 흔히 얘기하는 `Infrastructure as Code` 에 사용하는 소프트웨어이며, 필요한 리소스를 코드로 정의하고, 코드로 만들며, 코드로 관리 할 수 있습니다.

지금 가장 최신버전은 [0.13.5](https://releases.hashicorp.com/terraform/) 이며, 이 블로그에선 [0.12.29](https://releases.hashicorp.com/terraform/) 버전을 사용하여 소개를 진행 해보려고 합니다. 0.13.xx버전과 0.12.29버전의 차이가 있긴 하지만, 미묘한듯 보여 아직 조금 더 익숙한 0.12.29버전으로 글을 써보려 합니다.

> 맥에서 홈브루를 이용해 간단히 설치 할 수 있다
>
> brew install terraform # 최신버전 설치
>
> brew install terraform@0.12  # 0.12.29 버전 설치

테라폼의 수많은 장점들중, 몇가지 손에 꼽자면
- 코드에 정의된 설정와 실제 리소스에 정의 된 값의 변화를 트랙킹 할수 있다.
- Single source of truth를 정할수 있으며, 일반적인 어플리케이션의 코드처럼 관리가 가능하다.
- 같은 리소스를 최소한의 노력으로 다시 만들 수 있다.

이러한 장점을 가지고 있지만, 물론 단점 역시 존재한다.
- state이란 파일이 존재하며, 이 파일엔 infrastructure 설정값이 clear text로 저장되어 있다.
- diff를 찾을 때 (장점1), state파일을 이용해 찾으며, state 파일에 문제가 있다면, 또는 여러버전이 존재 한다면 테라폼은 자신의 일을 제대로 수행 할수 없다.
- 같은 리소스를 조금의 노력으로 만들 수 있다보니, 동일한 리소스를 많이 사용하게 되면 billing에 즉각적으로 반영된다.

이와같은 이유로 테라폼은 요즘들어 더 각광받는듯 싶습니다. 단점들이 있음에도 불구하고, 사용하는 팀마다 서로의 규칙을 만들어 단점을 극복하거나, [HashiCorp Enterprise](https://www.terraform.io/docs/enterprise/index.html)같은 CI/CD 솔루션으로 state파일부터 인프라 배포까지 맡겨 master 또는 production 브랜치와 sync차이가 최대한 어긋나지 않게끔 말입니다.

끝까지 읽어주셔서 감사합니다, 질문은 이메일, 링크드인 메시지, [깃헙이슈](https://github.com/iamjaekim/iamjaekim.github.io/issues)를 열어주시면, 아는 한도내에서 답 해드리겠습니다!

오늘도 좋은 하루 되세요!

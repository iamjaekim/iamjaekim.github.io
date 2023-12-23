---
layout: post
title: terraform - Version 1.0 General Availability
tags:
    - hashicorp
    - terraform
    - translation
    - infrastructure-as-code
slug: terraform-version-1-0-general-availability
description: terraform verision 1.0 release
lastmod: 2023-12-23T22:03:39.643Z
---

테라폼 v1.0 GA 릴리스

안녕하세요, 김재욱입니다. 오늘의 주제는 테라폼 1.0에 대한 이야기 입니다.
본 글은 해시코프의 블로그 글의 대한 키 포인트에 대한 의역입니다.

> https://www.hashicorp.com/blog/announcing-hashicorp-terraform-1-0-general-availability

테라폼 1.0은 해시코프 유럽 컨퍼런스 중 발표 및 릴리스 되었습니다. 테라폼 1.0은 기존 테라폼의 장점중이었던 interoperability, 손 쉬운 버전 업그레이드, 그리고 자동화 워크플로우 기능들이 대폭 개선 되었으며, 이것은 major milestone임에 틀림 없습니다. 현재 테라폼 1.0 버전은 공식홈페이지 또는 테라폼 클라우드에서 버전 1.0 선택하여 사용 가능합니다.

## State Interoperability
테라폼 1.0은 기존 테라폼 `0.14.x`부터 호환 및 지원 합니다. 기존 `0.14.x`버전 이상 사용자들의 경우 업그레이드, 마이그레이션, 그리고 하위버전 호환성에 대한 걱정없이 테라폼 1.0 업그레이드 및 사용이 가능합니다. 호환성의 큰 기능중 하나인, `remote state data` 리소스 타입은 `0.12.30`버전부터 지원했었으며, 마이그레이션을 고민 하는 해당 버전 state 백엔드 사용자들도 큰 변화와 차이없이, 해당 테라폼 버전 state 백엔드 리소스에 대한 지속적인 호환이 지원 될 예정입니다.

## Upgrade path to Terraform 1.0
테라폼 0.15 버전 이후 사용자들에 대해 테라폼 1.0 업그레이드는 이전버전들과 같이, 큰 변화와 새로운 툴 없이 자체 cli로 업그레이드 진행이 가능합니다. 0.15 이전버전 사용자들의 경우, 단계별로 업그레이드를 진행해야 될 것으로 예상됩니다.

## Terraform Support
테라폼 1.0 부터는 유지보수 지원이 최소 18개월로 스케쥴 되어있으며, 해당 기간동안 해시코프는 해당 테라폼 버전에 대한 기능 업그레이드 및 버그 픽스를 할 예정입니다.

끝까지 읽어주셔서 감사합니다, 질문은 이메일, 링크드인 메시지, [깃헙이슈](https://github.com/iamjaekim/iamjaekim.github.io/issues)로 열어주시면, 아는 한도내에서 답 해드리겠습니다!

오늘도 좋은 하루 되세요!

---
title: "Data augmentation for object detection via controllable diffusion models" 
date: 2024-01-04
tags: ["Data augmentation","Diffusion model","Object detection"]
author: ["Haoyang Fang, Boran Han, Shuai Zhang, Su Zhou, Cuixiong Hu, Wen-Ming Ye"]
description: "WACV 2024" 
summary: "WACV 2024" 
cover:
    image: "daod.png"
    alt: "Image caption"
    relative: false
editPost:
    URL: "https://openaccess.thecvf.com/content/WACV2024/html/Fang_Data_Augmentation_for_Object_Detection_via_Controllable_Diffusion_Models_WACV_2024_paper.html"
    Text: "Other Journal Name"

---

---

##### Download

+ [Paper](https://openaccess.thecvf.com/content/WACV2024/papers/Fang_Data_Augmentation_for_Object_Detection_via_Controllable_Diffusion_Models_WACV_2024_paper.pdf)
+ [Online appendix](https://openaccess.thecvf.com/content/WACV2024/supplemental/Fang_Data_Augmentation_for_WACV_2024_supplemental.pdf)

---

##### Abstract

Data augmentation is vital for object detection tasks that require expensive bounding box annotations. Recent successes in diffusion models have inspired the use of diffusion-based synthetic images for data augmentation. However, existing works have primarily focused on image classification, and their applicability to boost object detection's performance remains unclear. To address this gap, we propose a data augmentation pipeline based on controllable diffusion models and CLIP. Our approach involves generating appropriate visual priors to control the generation of synthetic data and implementing post-filtering techniques using category-calibrated CLIP scores. The evaluation of our approach is conducted under few-shot settings in MSCOCO, full PASCAL VOC dataset, and selected downstream datasets. We observe the performance increase using our augmentation pipeline. Specifically, the mAP improvement is+ 18.0%/+ 15.6%/+ 15.9% for COCO 5/10/30-shot,+ 2.9% on full PASCAL VOC dataset, and+ 12.4% on average for selected downstream datasets.

---

##### Figure X: Figure caption

![](daod.png.png)

---

##### Citation

Author 1 and Author 2. Year. "Title." *Journal* Volume (Issue): First page–Last page. https://doi.org/paper_doi.

```BibTeX
@InProceedings{Fang_2024_WACV,
    author    = {Fang, Haoyang and Han, Boran and Zhang, Shuai and Zhou, Su and Hu, Cuixiong and Ye, Wen-Ming},
    title     = {Data Augmentation for Object Detection via Controllable Diffusion Models},
    booktitle = {Proceedings of the IEEE/CVF Winter Conference on Applications of Computer Vision (WACV)},
    month     = {January},
    year      = {2024},
    pages     = {1257-1266}
}
```

---

